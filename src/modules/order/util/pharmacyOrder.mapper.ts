import { Prisma } from '@prisma/client';
import {
  ItemPharmacyOrderDetailsResponseDto,
  ItemPharmacyOrderListResponseDto,
  PatientInfoPharmacyOrderResponseDto,
  PharmacyOrderBaseResponseDto,
  PharmacyOrderDeliveryInfoDetailsResponseDto,
  PharmacyOrderDetailsResponseDto,
  PharmacyOrderListResponseDto,
} from '../dto/response.dto/pharmacyOrder.response.dto';
import {
  buildMedicineDisplayNameHelper,
  buildMedicinePackInfoHelper,
} from './medicineDisplayName.helper';
import { mapStatusToFilter } from './pharmacyOrderWhereBuilder.util';

export const pharmacyOrderWithRelations =
  Prisma.validator<Prisma.PharmacyOrderInclude>()({
    order: {
      include: {
        patient: {
          select: { id: true, name: true, profileImageUrl: true },
        },
        payment: { select: { method: true } },
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
export const pharmacyOrderDeliveryWithRelations =
  Prisma.validator<Prisma.PharmacyOrderInclude>()({
    delivery: {
      include: {
        driver: { select: { id: true, user: { select: { name: true } } } },
      },
    },
  });

export type PharmacyOrderWithRelations = Prisma.PharmacyOrderGetPayload<{
  include: typeof pharmacyOrderWithRelations;
}>;
export type PharmacyOrderDetailsDeliveryWithRelations =
  Prisma.PharmacyOrderGetPayload<{
    include: typeof pharmacyOrderDeliveryWithRelations;
  }>;

export type PharmacyOrderDetailsWithRelations = PharmacyOrderWithRelations &
  PharmacyOrderDetailsDeliveryWithRelations;
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
    orderId: po.orderId,
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
export function mapToPharmacyOrderDetails(
  po: PharmacyOrderDetailsWithRelations,
): PharmacyOrderDetailsResponseDto {
  const activePrescription = po.prescriptions?.[0] ?? null;
  const addressText = po.order.deliveryAddressLine;
  const lat = po.order.deliveryLatitude?.toNumber() ?? null;

  const lng = po.order.deliveryLongitude?.toNumber() ?? null;
  const itemsDetails: ItemPharmacyOrderDetailsResponseDto[] =
    po.pharmacyOrderItems.map((it) => ({
      pharmacyOrderItemId: it.id,
      inventoryId: it.inventoryItemId,
      medicineId: it.inventoryItem.medicineId,
      medicineDisplayName: buildMedicineDisplayNameHelper(
        it.inventoryItem.medicine,
      ),
      quantity: it.quantity,
      packDisplayName: buildMedicinePackInfoHelper(
        it.quantity,
        it.inventoryItem.medicine.packSize,
        it.inventoryItem.medicine.packUnit,
      ),
      isAvailable: it.inventoryItem.isAvailable,
    }));
  return {
    ...mapToPharmacyOrderList(po),
    delivery: po.delivery
      ? {
          deliveryId: po.delivery?.id ?? null,
          driverId: po.delivery?.driver?.id ?? null,
          driverName: po.delivery?.driver?.user.name ?? null,
          deliveredAt: po.delivery?.deliveredAt?.toISOString() ?? null,
        }
      : null,
    patient: mapToPharmacyOrderPatient(po),
    items: itemsDetails,
    itemsCount: itemsDetails.length,

    deliveryAddress: {
      lat,
      lng,
      addressText,
    },
    updatedAt: po.updatedAt.toISOString(),
    paymentMethod: po.order.payment?.method ?? null,
    prescriptionId: activePrescription?.id ?? null,
    prescriptionStatus: activePrescription?.status ?? null,
    pickedUpAt: po.pickedUpAt?.toISOString?.() ?? null,
    rejectedAt: po.rejectedAt?.toISOString?.() ?? null,
    acceptedAt: po.acceptedAt?.toISOString?.() ?? null,
    rejectionReason: po.rejectionReason ?? null,
    filter: mapStatusToFilter(po.status) ?? null,
  };
}
export const pharmacyOrderDetailsInclude =
  Prisma.validator<Prisma.PharmacyOrderInclude>()({
    ...pharmacyOrderWithRelations,
    ...pharmacyOrderDeliveryWithRelations,
  });
