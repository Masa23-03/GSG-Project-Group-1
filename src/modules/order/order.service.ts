import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  Currency,
  MedicineStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import { isPharmacyOpenNow } from '../pharmacy/util/helper';
import { CreateOrderDto } from './dto/request.dto/create-order.dto';
import { CalculatePharmacyOrderSubTotal } from './util/money-calc.util';
import { CreateOrderResponseDto } from './dto/response.dto/order.response.dto';
import { mapToOrderResponse, orderWithRelations } from './util/response.map';
import { isInventoryInStock } from './util/stock.helper';
import {
  AddressLite,
  InventoryLite,
  ParsedOrderRequest,
  PharmacyLite,
  PricingResult,
  ReqInv,
  UserContactLite,
} from './util/types.helper.create';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: DatabaseService) {}

  async createOrder(
    userId: number,
    dto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const parsed = this.parseOrderRequest(dto);
      const pharmacies = await this.loadAndValidatePharmacies(
        prisma,
        parsed.pharmacyIds,
      );
      const pickupCityId = pharmacies[0].cityId;
      const address = await this.loadAndValidateAddress(
        prisma,
        userId,
        dto.deliveryAddressId,
      );
      const inventories = await this.loadAndValidateInventories(
        prisma,
        parsed.inventoryIds,
        parsed.reqByInventoryId,
      );
      const prescriptionRequiredPharmacyIds =
        this.getPrescriptionRequiredPharmacyIds(inventories);
      this.validatePrescriptionRequirements(
        dto,
        prescriptionRequiredPharmacyIds,
      );

      await this.validatePrescriptionPairs(prisma, userId, dto);

      const cityDeliveryFee = await prisma.cityDeliveryFee.findUnique({
        where: { cityId: pickupCityId },
        select: {
          standardFeeAmount: true,
          expressFeeAmount: true,
          currency: true,
        },
      });

      if (!cityDeliveryFee) {
        throw new BadRequestException(
          'Delivery fee is not configured for this city',
        );
      }
      const deliveryFee = cityDeliveryFee.standardFeeAmount;
      const currency = dto.currency ?? cityDeliveryFee.currency;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phoneNumber: true },
      });
      if (!user) throw new BadRequestException('User not found');

      const pricing = this.computePricing(
        dto,
        inventories,
        currency,
        deliveryFee,
      );
      const { orderId, poIdByPharmacyId } = await this.createOrderRows(prisma, {
        userId,
        dto,
        pickupCityId,
        address,
        user,
        pricing,
        deliveryFee,
        currency,
      });
      await this.decrementStock(prisma, dto);
      await this.attachPrescriptions(prisma, userId, dto, poIdByPharmacyId);
      const fullOrder = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: orderWithRelations,
      });

      return mapToOrderResponse(fullOrder);
    });
  }
  //load pharmacies and do validation on pharmacies
  private async loadAndValidatePharmacies(
    prisma: Prisma.TransactionClient,
    pharmacyIds: number[],
  ): Promise<PharmacyLite[]> {
    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        id: { in: pharmacyIds },
        verificationStatus: VerificationStatus.VERIFIED,
        user: { is: { status: UserStatus.ACTIVE } },
      },
      select: {
        id: true,
        cityId: true,
        workOpenTime: true,
        workCloseTime: true,
      },
    });

    if (pharmacies.length !== pharmacyIds.length)
      throw new BadRequestException('One or more pharmacies are invalid');

    const pickupCityId = pharmacies[0].cityId;

    for (const ph of pharmacies) {
      if (ph.cityId !== pickupCityId) {
        throw new BadRequestException(
          'All pharmacies must be in the same city',
        );
      }
      if (!isPharmacyOpenNow(ph.workOpenTime, ph.workCloseTime))
        throw new BadRequestException(`Pharmacy is closed now: ${ph.id}`);
    }

    return pharmacies;
  }
  //load patient address and do validation
  private async loadAndValidateAddress(
    prisma: Prisma.TransactionClient,
    userId: number,
    deliveryAddressId: number,
  ): Promise<AddressLite> {
    const address = await prisma.patientAddress.findFirst({
      where: {
        id: deliveryAddressId,
        userId,
        isDeleted: false,
      },
      select: {
        addressLine1: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!address) throw new BadRequestException('Invalid delivery address');
    return address;
  }
  //load inventories and do validation on inventory
  private async loadAndValidateInventories(
    prisma: Prisma.TransactionClient,
    inventoryIds: number[],
    reqByInventoryId: Map<number, ReqInv>,
  ): Promise<InventoryLite[]> {
    const inventories = await prisma.inventoryItem.findMany({
      where: {
        id: { in: inventoryIds },
        isDeleted: false,
        isAvailable: true,
        stockQuantity: { gt: 0 },
        OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
        medicine: {
          isActive: true,
          status: MedicineStatus.APPROVED,
        },
      },
      select: {
        id: true,
        pharmacyId: true,
        stockQuantity: true,
        sellPrice: true,
        medicine: { select: { requiresPrescription: true } },
      },
    });

    if (inventories.length !== inventoryIds.length)
      throw new BadRequestException('One or more medicines are invalid');

    for (const inv of inventories) {
      const req = reqByInventoryId.get(inv.id);
      if (!req)
        throw new BadRequestException(
          `Invalid inventory in request: ${inv.id}`,
        );

      if (inv.pharmacyId !== req.pharmacyId)
        throw new BadRequestException(
          `Inventory ${inv.id} does not belong to pharmacy ${req.pharmacyId}`,
        );

      if (!isInventoryInStock(req.quantity, inv.stockQuantity))
        throw new BadRequestException(
          `Not enough stock for inventory ${inv.id}`,
        );
    }
    return inventories;
  }
  //discover if pharmacy order require prescription or not
  private getPrescriptionRequiredPharmacyIds(
    inventories: InventoryLite[],
  ): Set<number> {
    const set = new Set<number>();
    for (const inv of inventories) {
      if (inv.medicine.requiresPrescription) set.add(inv.pharmacyId);
    }
    return set;
  }
  //validate prescription
  private validatePrescriptionRequirements(
    dto: CreateOrderDto,
    prescriptionRequiredPharmacyIds: Set<number>,
  ) {
    for (const p of dto.pharmacies) {
      if (
        prescriptionRequiredPharmacyIds.has(p.pharmacyId) &&
        !p.prescriptionId
      ) {
        throw new BadRequestException(
          `Prescription required for pharmacy ${p.pharmacyId}`,
        );
      }
    }
  }
  private async validatePrescriptionPairs(
    prisma: Prisma.TransactionClient,
    userId: number,
    dto: CreateOrderDto,
  ) {
    // collect pairs
    const pairs = dto.pharmacies
      .filter((p) => typeof p.prescriptionId === 'number')
      .map((p) => ({
        pharmacyId: p.pharmacyId,
        prescriptionId: p.prescriptionId as number,
      }));

    if (!pairs.length) return;

    // prevent duplicate prescriptionId across pharmacies in request
    // (same prescription cannot be used twice)
    const seen = new Set<number>();
    for (const x of pairs) {
      if (seen.has(x.prescriptionId)) {
        throw new BadRequestException(
          `Duplicate prescriptionId in request: ${x.prescriptionId}`,
        );
      }
      seen.add(x.prescriptionId);
    }

    const prescriptionIds = pairs.map((x) => x.prescriptionId);
    const rows = await prisma.prescription.findMany({
      where: {
        id: { in: prescriptionIds },
        patientId: userId,
        pharmacyOrderId: null,
      },
      select: { id: true, pharmacyId: true },
    });

    if (rows.length !== prescriptionIds.length) {
      throw new BadRequestException('Invalid prescriptionId');
    }

    const pharmacyByPrescriptionId = new Map(
      rows.map((r) => [r.id, r.pharmacyId]),
    );

    for (const p of pairs) {
      const expectedPharmacyId = pharmacyByPrescriptionId.get(p.prescriptionId);
      if (expectedPharmacyId !== p.pharmacyId) {
        throw new BadRequestException(
          `Prescription ${p.prescriptionId} does not belong to pharmacy ${p.pharmacyId}`,
        );
      }
    }
  }

  // Compute pricing
  private computePricing(
    dto: CreateOrderDto,
    inventories: InventoryLite[],
    currency: Currency,
    deliveryFee: Prisma.Decimal,
  ): PricingResult {
    const pharmacyOrdersData = dto.pharmacies.map((p) =>
      this.buildSinglePharmacyOrder({
        pharmacyDto: p,
        inventories,
        currency,
      }),
    );

    const subTotalAmount = pharmacyOrdersData.reduce(
      (acc, p) => acc.add(p.totalAmount),
      new Prisma.Decimal(0),
    );

    const itemsCount = pharmacyOrdersData.reduce(
      (acc, p) => acc + p.itemsCount,
      0,
    );

    const totalAmount = subTotalAmount.add(deliveryFee);

    return { pharmacyOrdersData, subTotalAmount, itemsCount, totalAmount };
  }
  //create order rows
  private async createOrderRows(
    prisma: Prisma.TransactionClient,
    args: {
      userId: number;
      dto: CreateOrderDto;
      pickupCityId: number;
      address: AddressLite;
      user: UserContactLite;
      pricing: PricingResult;
      deliveryFee: Prisma.Decimal;
      currency: Currency;
    },
  ) {
    const {
      userId,
      dto,
      pickupCityId,
      address,
      user,
      pricing,
      deliveryFee,
      currency,
    } = args;

    const created = await prisma.order.create({
      data: {
        patientId: userId,
        addressId: dto.deliveryAddressId,
        pickupCityId,

        deliveryAddressLine: address.addressLine1,
        deliveryLatitude: address.latitude,
        deliveryLongitude: address.longitude,

        contactEmail: user.email,
        contactName: user.name,
        contactPhone: user.phoneNumber,

        currency,
        itemsCount: pricing.itemsCount,
        originalItemsCount: pricing.itemsCount,

        subtotalAmount: pricing.subTotalAmount,
        originalSubtotalAmount: pricing.subTotalAmount,

        totalAmount: pricing.totalAmount,
        originalTotalAmount: pricing.totalAmount,

        notes: dto.notes ?? null,
        deliveryFeeAmount: deliveryFee,

        pharmacyOrders: {
          create: pricing.pharmacyOrdersData.map((p) => ({
            pharmacyId: p.pharmacyId,
            requiresPrescription: p.requiresPrescription,
            currency: p.currency,
            totalAmount: p.totalAmount,
            pharmacyOrderItems: p.pharmacyOrderItems,
          })),
        },

        payment: {
          create: {
            amount: pricing.totalAmount,
            currency,
            status: PaymentStatus.PENDING,
            method: PaymentMethod.COD,
          },
        },
      },
      select: {
        id: true,
        pharmacyOrders: { select: { id: true, pharmacyId: true } },
      },
    });

    const poIdByPharmacyId = new Map(
      created.pharmacyOrders.map((po) => [po.pharmacyId, po.id]),
    );

    return { orderId: created.id, poIdByPharmacyId };
  }
  //update inventory stock
  private async decrementStock(
    prisma: Prisma.TransactionClient,
    dto: CreateOrderDto,
  ) {
    const ops = dto.pharmacies.flatMap((p) =>
      p.items.map((i) =>
        prisma.inventoryItem.updateMany({
          where: {
            id: i.inventoryId,
            pharmacyId: p.pharmacyId,
            isDeleted: false,
            isAvailable: true,
            stockQuantity: { gte: i.quantity },
          },
          data: { stockQuantity: { decrement: i.quantity } },
        }),
      ),
    );

    const results = await Promise.all(ops);

    const failedIndex = results.findIndex((r) => r.count !== 1);
    if (failedIndex !== -1) {
      throw new BadRequestException('Stock changed cannot fulfill order');
    }
  }

  //update prescription (attach it)
  private async attachPrescriptions(
    prisma: Prisma.TransactionClient,
    userId: number,
    dto: CreateOrderDto,
    poIdByPharmacyId: Map<number, number>,
  ) {
    for (const p of dto.pharmacies) {
      if (!p.prescriptionId) continue;

      const pharmacyOrderId = poIdByPharmacyId.get(p.pharmacyId);
      if (!pharmacyOrderId) {
        throw new BadRequestException(
          `Missing pharmacy order for ${p.pharmacyId}`,
        );
      }

      const updated = await prisma.prescription.updateMany({
        where: {
          id: p.prescriptionId,
          patientId: userId,
          pharmacyOrderId: null,
          pharmacyId: p.pharmacyId,
        },
        data: {
          pharmacyOrderId,
        },
      });

      if (updated.count !== 1) {
        throw new BadRequestException(
          `Invalid prescriptionId ${p.prescriptionId}`,
        );
      }
    }
  }

  private buildSinglePharmacyOrder({
    pharmacyDto,

    inventories,
    currency,
  }: {
    pharmacyDto: CreateOrderDto['pharmacies'][number];
    inventories: InventoryLite[];
    currency: Currency;
  }) {
    const inventoryById = new Map(inventories.map((i) => [i.id, i]));
    const calculateInput = pharmacyDto.items.map((i) => {
      const inventory = inventoryById.get(i.inventoryId);
      if (!inventory)
        throw new BadRequestException(`Invalid inventoryId ${i.inventoryId}`);
      return {
        itemId: inventory.id,
        quantity: i.quantity,
        unitPrice: inventory.sellPrice,
      };
    });

    const { items, subTotal, itemsCount } =
      CalculatePharmacyOrderSubTotal(calculateInput);
    const requiresPrescription = items.some((i) => {
      const inventory = inventoryById.get(i.itemId)!;
      return inventory.medicine.requiresPrescription;
    });

    return {
      pharmacyId: pharmacyDto.pharmacyId,
      prescriptionId: pharmacyDto.prescriptionId ?? null,
      requiresPrescription,
      currency,
      totalAmount: subTotal,
      itemsCount,
      pharmacyOrderItems: {
        create: items.map((i) => ({
          inventoryItemId: i.itemId,
          quantity: i.quantity,
          pricePerItem: i.unitPrice,
          total: i.totalPrice,
          currency,
        })),
      },
    };
  }
  //parse request
  private parseOrderRequest(dto: CreateOrderDto): ParsedOrderRequest {
    if (!dto.pharmacies?.length)
      throw new BadRequestException('pharmacies are required');
    const pharmacyIdSet = new Set<number>();
    const reqByInventoryId = new Map<number, ReqInv>();
    for (const p of dto.pharmacies) {
      if (!Number.isInteger(p.pharmacyId) || p.pharmacyId <= 0) {
        throw new BadRequestException('Invalid pharmacyId');
      }
      if (pharmacyIdSet.has(p.pharmacyId)) {
        throw new BadRequestException(`Duplicate pharmacyId: ${p.pharmacyId}`);
      }
      pharmacyIdSet.add(p.pharmacyId);

      if (!p.items?.length) {
        throw new BadRequestException(
          `items is required for pharmacy ${p.pharmacyId}`,
        );
      }

      for (const it of p.items) {
        const invId = it.inventoryId;
        if (reqByInventoryId.has(invId)) {
          throw new BadRequestException(
            `Duplicate inventoryId in request: ${invId}`,
          );
        }
        reqByInventoryId.set(invId, {
          pharmacyId: p.pharmacyId,
          quantity: it.quantity,
        });
      }
    }
    return {
      pharmacyIds: [...pharmacyIdSet],
      inventoryIds: [...reqByInventoryId.keys()],
      reqByInventoryId,
    };
  }
}
