import { OrderStatus } from '@prisma/client';

export const CAN_TRACK = new Set<OrderStatus>([
  OrderStatus.ACCEPTED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.PARTIALLY_ACCEPTED,
  OrderStatus.PROCESSING,
  OrderStatus.PENDING,
]);

export function canTrack(orderStatus: OrderStatus): boolean {
  if (CAN_TRACK.has(orderStatus)) return true;
  else return false;
}
