import { Prisma } from '@prisma/client';
import {
  ItemPharmacyOrderListResponseDto,
  PatientInfoPharmacyOrderResponseDto,
  PharmacyOrderBaseResponseDto,
  PharmacyOrderListResponseDto,
} from '../dto/response.dto/pharmacyOrder.response.dto';
import { buildMedicineDisplayNameHelper } from './medicineDisplayName.helper';

export const pharmacyOrderWithRelations =
  Prisma.validator<Prisma.PharmacyOrderInclude>()({
    order: {
      include: {
        patient: {
          select: { id: true, name: true, profileImageUrl: true },
        },
      },
    },
    pharmacyOrderItems: {
      include: {
        inventoryItem: {
          include: { medicine: true },
        },
      },
    },
    prescriptions: {
      where: { isActive: true },
      select: { id: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    },
  });

export type PharmacyOrderWithRelations = Prisma.PharmacyOrderGetPayload<{
  include: typeof pharmacyOrderWithRelations;
}>;
export function mapToPharmacyOrderBase(
  po: Pick<
    PharmacyOrderWithRelations,
    | 'id'
    | 'createdAt'
    | 'orderId'
    | 'status'
    | 'currency'
    | 'totalAmount'
    | 'deliveryId'
    | 'requiresPrescription'
  >,
): PharmacyOrderBaseResponseDto {
  return {
    pharmacyOrderId: po.id,
    orderId: po.id,
    createdAt: po.createdAt.toISOString(),
    status: po.status,
    currency: po.currency,
    totalAmount: Number(po.totalAmount),
    requirePrescription: po.requiresPrescription,
    deliveryId: po.deliveryId ?? null,
  };
}

export function mapToPharmacyOrderPatient(
  pi: Pick<PharmacyOrderWithRelations, 'order'>,
): PatientInfoPharmacyOrderResponseDto {
  return {
    patientId: pi.order.patientId,
    patientName: pi.order.patient.name,
    profileImageUrl: pi.order.patient.profileImageUrl ?? null,
  };
}

export function mapToPharmacyOrderItemList(
  item: PharmacyOrderWithRelations['pharmacyOrderItems'][number],
): ItemPharmacyOrderListResponseDto {
  return {
    pharmacyOrderItemId: item.id,
    inventoryId: item.inventoryItemId,
    medicineId: item.inventoryItem.medicineId,
    medicineDisplayName: buildMedicineDisplayNameHelper(
      item.inventoryItem.medicine,
    ),
  };
}

export function mapToPharmacyOrderList(
  po: PharmacyOrderWithRelations,
): PharmacyOrderListResponseDto {
  return {
    ...mapToPharmacyOrderBase(po),
    patient: mapToPharmacyOrderPatient(po),
    items: po.pharmacyOrderItems.map(mapToPharmacyOrderItemList),
  };
}
