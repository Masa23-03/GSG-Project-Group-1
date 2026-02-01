import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  Currency,
  InventoryItem,
  MedicineStatus,
  PaymentMethod,
  PaymentStatus,
  Pharmacy,
  Prisma,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import { isPharmacyOpenNow } from '../pharmacy/util/helper';
import { CreateOrderDto } from './dto/request.dto/create-order.dto';
import { CalculatePharmacyOrderSubTotal } from './util/money-calc.util';
import { CreateOrderResponseDto } from './dto/response.dto/order.response.dto';
import { mapToOrderResponse, orderWithRelations } from './util/response.map';

type ReqInv = { pharmacyId: number; quantity: number };
type InventoryLite = {
  id: number;
  pharmacyId: number;
  sellPrice: Prisma.Decimal;
  medicine: { requiresPrescription: boolean };
};

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: DatabaseService) {}

  async createOrder(
    userId: number,
    dto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return this.prismaService.$transaction(async (prisma) => {
      if (!dto.pharmacies?.length) {
        throw new BadRequestException('pharmacies are required');
      }

      const pharmacyIdSet = new Set<number>();
      const reqByInventoryId = new Map<number, ReqInv>();

      for (const p of dto.pharmacies) {
        if (!Number.isInteger(p.pharmacyId) || p.pharmacyId <= 0) {
          throw new BadRequestException('Invalid pharmacyId');
        }
        if (pharmacyIdSet.has(p.pharmacyId)) {
          throw new BadRequestException(
            `Duplicate pharmacyId: ${p.pharmacyId}`,
          );
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

      const pharmacyIds = [...pharmacyIdSet];
      const inventoryIds = [...reqByInventoryId.keys()];

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

      if (pharmacies.length !== pharmacyIds.length) {
        throw new BadRequestException('One or more pharmacies are invalid');
      }

      const pickupCityId = pharmacies[0].cityId;

      for (const ph of pharmacies) {
        if (ph.cityId !== pickupCityId) {
          throw new BadRequestException(
            'All pharmacies must be in the same city',
          );
        }
        if (!isPharmacyOpenNow(ph.workOpenTime, ph.workCloseTime)) {
          throw new BadRequestException(`Pharmacy is closed now: ${ph.id}`);
        }
      }

      const address = await prisma.patientAddress.findFirst({
        where: {
          id: dto.deliveryAddressId,
          userId,
          isDeleted: false,
        },
        select: {
          addressLine1: true,
          latitude: true,
          longitude: true,
        },
      });

      if (!address) {
        throw new BadRequestException('Invalid delivery address');
      }

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

      if (inventories.length !== inventoryIds.length) {
        throw new BadRequestException('One or more medicines are invalid');
      }

      const prescriptionRequiredPharmacyIds = new Set<number>();

      for (const inv of inventories) {
        const req = reqByInventoryId.get(inv.id);
        if (!req) {
          throw new BadRequestException(
            `Invalid inventory in request: ${inv.id}`,
          );
        }

        if (inv.pharmacyId !== req.pharmacyId) {
          throw new BadRequestException(
            `Inventory ${inv.id} does not belong to pharmacy ${req.pharmacyId}`,
          );
        }

        if (req.quantity > inv.stockQuantity) {
          throw new BadRequestException(
            `Not enough stock for inventory ${inv.id}`,
          );
        }

        if (inv.medicine.requiresPrescription) {
          prescriptionRequiredPharmacyIds.add(inv.pharmacyId);
        }
      }
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
      const prescriptionIds = dto.pharmacies
        .map((p) => p.prescriptionId)
        .filter((v): v is number => typeof v === 'number');

      const uniquePrescriptionIds = [...new Set(prescriptionIds)];
      if (uniquePrescriptionIds.length) {
        const count = await prisma.prescription.count({
          where: {
            id: { in: uniquePrescriptionIds },
            patientId: userId,
            pharmacyOrderId: { equals: null },
          },
        });

        if (count !== uniquePrescriptionIds.length) {
          throw new BadRequestException('Invalid prescriptionId');
        }
      }

      const cityDeliveryFee = await prisma.cityDeliveryFee.findUnique({
        where: { cityId: pickupCityId },
        select: {
          standardFeeAmount: true,
          expressFeeAmount: true,
          currency: true,
        },
      });
      if (!cityDeliveryFee)
        throw new BadRequestException(
          'Delivery fee is not configured for this city',
        );

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phoneNumber: true },
      });
      if (!user) throw new BadRequestException('User not found');
      const deliveryFee = cityDeliveryFee.standardFeeAmount;
      const currency = dto.currency ?? cityDeliveryFee.currency;

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

      const createdOrder = await prisma.order.create({
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
          currency: currency,
          itemsCount,
          originalItemsCount: itemsCount,
          subtotalAmount: subTotalAmount,
          originalSubtotalAmount: subTotalAmount,
          totalAmount: totalAmount,
          originalTotalAmount: totalAmount,

          notes: dto.notes ?? null,
          deliveryFeeAmount: deliveryFee,

          pharmacyOrders: {
            create: pharmacyOrdersData.map((p) => ({
              pharmacyId: p.pharmacyId,
              requiresPrescription: p.requiresPrescription,
              currency: p.currency,
              totalAmount: p.totalAmount,
              pharmacyOrderItems: p.pharmacyOrderItems,
            })),
          },

          payment: {
            create: {
              amount: totalAmount,
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
        createdOrder.pharmacyOrders.map((po) => [po.pharmacyId, po.id]),
      );

      for (const p of dto.pharmacies) {
        for (const i of p.items) {
          const updated = await prisma.inventoryItem.updateMany({
            where: {
              id: i.inventoryId,
              pharmacyId: p.pharmacyId,
              isDeleted: false,
              isAvailable: true,
              stockQuantity: { gte: i.quantity },
            },
            data: {
              stockQuantity: { decrement: i.quantity },
            },
          });
          if (updated.count !== 1)
            throw new BadRequestException(
              `Stock changed cannot fulfill inventory ${i.inventoryId}`,
            );
        }

        if (!p.prescriptionId) continue;
        const pharmacyOrderId = poIdByPharmacyId.get(p.pharmacyId);
        if (!pharmacyOrderId)
          throw new BadRequestException(
            `Missing pharmacy order for ${p.pharmacyId}`,
          );
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
        if (updated.count !== 1)
          throw new BadRequestException(
            `Invalid prescriptionId ${p.prescriptionId}`,
          );
      }

      const fullOrder = await prisma.order.findUniqueOrThrow({
        where: { id: createdOrder.id },
        include: orderWithRelations,
      });

      return mapToOrderResponse(fullOrder);
    });
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
      const inventory = inventoryById.get(i.inventoryId)!;
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
}
