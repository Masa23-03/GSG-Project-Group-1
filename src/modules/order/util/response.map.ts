import { Prisma } from '@prisma/client';
import {
  CreateOrderResponseDto,
  CreatePharmacyOrderItemResponseDto,
  CreatePharmacyOrderResponseDto,
} from '../dto/response.dto/order.response.dto';

export const orderWithRelations = {
  address: true,
  patient: {
    select: {
      email: true,
      name: true,
      phoneNumber: true,
    },
  },
  pharmacyOrders: {
    include: {
      pharmacy: true,
      pharmacyOrderItems: {
        include: {
          inventoryItem: {
            include: {
              medicine: true,
            },
          },
        },
      },
      prescriptions: {
        where: { isActive: true },
        select: { id: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  },
} satisfies Prisma.OrderInclude;
export type PharmacyOrderWithRelations = Prisma.PharmacyOrderGetPayload<{
  include: typeof orderWithRelations.pharmacyOrders.include;
}>;

export type PharmacyOrderItemWithRelations =
  Prisma.PharmacyOrderItemGetPayload<{
    include: typeof orderWithRelations.pharmacyOrders.include.pharmacyOrderItems.include;
  }>;
export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderWithRelations;
}>;
export const mapToOrderResponse = (
  order: OrderWithRelations,
): CreateOrderResponseDto => {
  const addressText = order.deliveryAddressLine;
  const lat =
    order.deliveryLatitude?.toNumber() ??
    order.address?.latitude?.toNumber() ??
    null;

  const lng =
    order.deliveryLongitude?.toNumber() ??
    order.address?.longitude?.toNumber() ??
    null;

  return {
    id: order.id,
    status: order.status,
    notes: order.notes ?? null,
    createdAt: order.createdAt.toISOString(),
    subtotal: order.subtotalAmount.toNumber(),
    deliveryFee: order.deliveryFeeAmount.toNumber(),
    discount: order.discountAmount.toNumber(),
    total: order.totalAmount.toNumber(),
    itemsCount: order.itemsCount,
    contactEmail: order.patient.email,
    contactName: order.patient.name,
    contactPhone: order.patient.phoneNumber,
    currency: order.currency,
    deliveryAddress: {
      addressText,
      lat,
      lng,
    },
    pharmacies: order.pharmacyOrders.map((o) => mapPharmacyOrder(o)),
  };
};

export const mapOrderItem = (
  oi: PharmacyOrderItemWithRelations,
): CreatePharmacyOrderItemResponseDto => {
  return {
    inventoryId: oi.inventoryItemId,
    medicineId: oi.inventoryItem.medicineId,
    medicineName: oi.inventoryItem.medicine.genericName,
    quantity: oi.quantity,
    unitPrice: oi.pricePerItem.toNumber(),
    totalPrice: oi.total.toNumber(),
  };
};

export const mapPharmacyOrder = (
  o: PharmacyOrderWithRelations,
): CreatePharmacyOrderResponseDto => {
  const currentPrescription = o.prescriptions?.[0];
  return {
    pharmacyOrderId: o.id,
    pharmacyId: o.pharmacyId,
    pharmacyName: o.pharmacy.pharmacyName,
    status: o.status,
    subtotal: o.totalAmount.toNumber(),
    requiresPrescription: o.requiresPrescription,
    prescriptionId: currentPrescription?.id ?? null,
    prescriptionStatus: currentPrescription?.status ?? null,
    pharmacyLocation: {
      address: o.pharmacy.address ?? null,
      latitude: o.pharmacy.latitude?.toNumber() ?? null,
      longitude: o.pharmacy.longitude?.toNumber() ?? null,
    },
    items: o.pharmacyOrderItems.map((item) => mapOrderItem(item)),
  };
};
