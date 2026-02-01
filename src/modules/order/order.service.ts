import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MedicineStatus, UserStatus, VerificationStatus } from '@prisma/client';
import { isPharmacyOpenNow } from '../pharmacy/util/helper';
import { CreateOrderDto } from './dto/request.dto/create-order.dto';

type ReqInv = { pharmacyId: number; quantity: number };

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: DatabaseService) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
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
    });
  }
}
