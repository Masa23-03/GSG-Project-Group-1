import { Prisma } from "@prisma/client";
import { AdminOrderListItemDto } from "../dto/response.dto/admin-order-listItem.response.dto";

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