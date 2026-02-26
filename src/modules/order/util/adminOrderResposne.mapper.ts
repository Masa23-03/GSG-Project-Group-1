import { Prisma } from '@prisma/client';
import { AdminOrderListItemDto } from '../dto/response.dto/admin-order-listItem.response.dto';
import {
  AdminOrderDetailsDto,
  AdminOrderItemDto,
  AdminPrescriptionDto,
} from '../dto/response.dto/admin-order-details.response.dto';

export const adminOrderListInclude = Prisma.validator<Prisma.OrderInclude>()({
  patient: { select: { id: true, name: true } },
  payment: { select: { status: true, method: true } },
  delivery: { select: { status: true } },
  pharmacyOrders: {
    select: {
      pharmacy: { select: { pharmacyName: true } },
    },
  },
});

export const adminOrderDetailsInclude = Prisma.validator<Prisma.OrderInclude>()(
  {
    patient: {
      select: { id: true, name: true, phoneNumber: true, email: true },
    },
    payment: {
      select: {
        id: true,
        status: true,
        method: true,
        amount: true,
        currency: true,
      },
    },
    delivery: {
      include: {
        driver: {
          include: {
            user: { select: { name: true, phoneNumber: true } },
          },
        },
      },
    },
    pharmacyOrders: {
      include: {
        pharmacy: { select: { id: true, pharmacyName: true } },
        pharmacyOrderItems: {
          include: {
            inventoryItem: {
              include: {
                medicine: {
                  select: { id: true, genericName: true },
                },
              },
            },
          },
        },
        prescriptions: {
          include: {
            prescriptionFiles: { select: { url: true, sortOrder: true } },
          },
        },
      },
    },
  },
);

export type AdminOrderDetailsWithRelations = Prisma.OrderGetPayload<{
  include: typeof adminOrderDetailsInclude;
}>;

export type AdminOrderListWithRelations = Prisma.OrderGetPayload<{
  include: typeof adminOrderListInclude;
}>;

export function mapToAdminOrderListItem(
  order: AdminOrderListWithRelations,
): AdminOrderListItemDto {
  const pharmacyCount = order.pharmacyOrders.length;

  const pharmacyLabel =
    pharmacyCount > 1
      ? 'Multiple'
      : order.pharmacyOrders[0]?.pharmacy?.pharmacyName || 'N/A';

  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    patient: {
      id: order.patient.id,
      name: order.patient.name,
    },
    payment: order.payment
      ? {
          status: order.payment.status,
          method: order.payment.method,
        }
      : undefined,
    delivery: order.delivery
      ? {
          status: order.delivery.status,
        }
      : undefined,
    pharmacyLabel,
  };
}

function mapItems(
  pharmacyOrders: AdminOrderDetailsWithRelations['pharmacyOrders'],
): AdminOrderItemDto[] {
  return pharmacyOrders.flatMap((po) =>
    po.pharmacyOrderItems.map((item) => ({
      medicineId: item.inventoryItem.medicine.id,
      medicineName: item.inventoryItem.medicine.genericName,
      quantity: item.quantity,
      unitPrice: Number(item.pricePerItem),
      total: Number(item.total),
      pharmacyId: po.pharmacy.id,
      pharmacyName: po.pharmacy.pharmacyName,
    })),
  );
}

function mapPrescriptions(
  pharmacyOrders: AdminOrderDetailsWithRelations['pharmacyOrders'],
): AdminPrescriptionDto[] {
  return pharmacyOrders.flatMap((po) =>
    po.prescriptions.map((p) => ({
      id: p.id,
      status: p.status,
      files: p.prescriptionFiles.map((f) => ({
        url: f.url,
        sortOrder: f.sortOrder,
      })),
    })),
  );
}

function mapDelivery(delivery: AdminOrderDetailsWithRelations['delivery']) {
  if (!delivery) return null;

  return {
    id: delivery.id,
    status: delivery.status,
    acceptedAt: delivery.acceptedAt ?? undefined,
    deliveredAt: delivery.deliveredAt ?? undefined,
    driver: delivery.driver
      ? {
          id: delivery.driver.id,
          name: delivery.driver.user.name,
          phoneNumber: delivery.driver.user.phoneNumber,
        }
      : undefined,
  };
}

function mapPayment(payment: AdminOrderDetailsWithRelations['payment']) {
  if (!payment) return null;

  return {
    id: payment.id,
    status: payment.status,
    method: payment.method,
    amount: Number(payment.amount),
    currency: payment.currency,
  };
}

export function mapToAdminOrderDetails(
  order: AdminOrderDetailsWithRelations,
): AdminOrderDetailsDto {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    subtotalAmount: Number(order.subtotalAmount),
    discountAmount: Number(order.discountAmount),
    deliveryFeeAmount: Number(order.deliveryFeeAmount),
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    deliveryType: order.deliveryType,
    notes: order.notes ?? undefined,
    patient: order.patient,
    payment: mapPayment(order.payment),
    delivery: mapDelivery(order.delivery),
    items: mapItems(order.pharmacyOrders),
    prescriptions: mapPrescriptions(order.pharmacyOrders),
  };
}
