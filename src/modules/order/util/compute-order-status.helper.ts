import { BadRequestException } from '@nestjs/common';
import {
  DeliveryStatus,
  OrderStatus,
  PharmacyOrderStatus,
} from '@prisma/client';

type deliveryStatus = { status: DeliveryStatus } | null;
function getCount(
  status: PharmacyOrderStatus,
  statuses: PharmacyOrderStatus[],
): number {
  return statuses.filter((x) => x === status).length;
}
export function computeOrderStatus(
  pharmacyOrders: PharmacyOrderStatus[],
  delivery: deliveryStatus,
): OrderStatus {
  if (!pharmacyOrders.length)
    throw new BadRequestException('No pharmacy orders to compute status.');
  if (delivery) {
    if (delivery.status === DeliveryStatus.DELIVERED)
      return OrderStatus.DELIVERED;
    if (
      delivery.status === DeliveryStatus.ASSIGNED ||
      delivery.status === DeliveryStatus.PICKUP_IN_PROGRESS ||
      delivery.status === DeliveryStatus.EN_ROUTE
    ) {
      return OrderStatus.OUT_FOR_DELIVERY;
    }
  }

  const total = pharmacyOrders.length;
  const pending = getCount(PharmacyOrderStatus.PENDING, pharmacyOrders);
  const preparing = getCount(PharmacyOrderStatus.PREPARING, pharmacyOrders);
  const cancelled = getCount(PharmacyOrderStatus.CANCELLED, pharmacyOrders);
  const accepted = getCount(PharmacyOrderStatus.ACCEPTED, pharmacyOrders);
  const completed = getCount(PharmacyOrderStatus.COMPLETED, pharmacyOrders);
  const rejected = getCount(PharmacyOrderStatus.REJECTED, pharmacyOrders);
  const readyForPickup = getCount(
    PharmacyOrderStatus.READY_FOR_PICKUP,
    pharmacyOrders,
  );
  const pickedUp = getCount(PharmacyOrderStatus.PICKED_UP, pharmacyOrders);
  //REJECTED
  if (rejected === total) return OrderStatus.REJECTED;
  //CANCELLED
  if (cancelled === total) return OrderStatus.CANCELLED;
  //if the pharmacy rejected the order before the patient cancel it
  if (cancelled + rejected === total) return OrderStatus.CANCELLED;

  //DELIVERED
  if (completed === total) return OrderStatus.DELIVERED;

  //OUT FOR DELIVERY
  if (pickedUp > 0) return OrderStatus.OUT_FOR_DELIVERY;

  //PROCESSING
  if (preparing > 0 || readyForPickup > 0) return OrderStatus.PROCESSING;
  //PENDING
  if (pending > 0) return OrderStatus.PENDING;

  //PARTIALLY ACCEPTED
  if (accepted + rejected === total && accepted > 0 && rejected > 0) {
    return OrderStatus.PARTIALLY_ACCEPTED;
  }
  //ACCEPTED
  if (accepted === total) return OrderStatus.ACCEPTED;

  throw new BadRequestException(
    `Unhandled pharmacy order status mix: ${pharmacyOrders.join(', ')}`,
  );
}
