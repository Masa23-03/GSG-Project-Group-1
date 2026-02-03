import { Order, OrderStatus } from '@prisma/client';
import { OrderFilter } from '../dto/request.dto/order.query.dto';

const ACTIVE_STATUSES = new Set<OrderStatus>([
  OrderStatus.ACCEPTED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.PARTIALLY_ACCEPTED,
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
]);
export function patientOrderFilterMapper(
  orderStatus: OrderStatus,
): OrderFilter {
  if (orderStatus === OrderStatus.DELIVERED) return OrderFilter.DELIVERED;

  if (
    orderStatus === OrderStatus.CANCELLED ||
    orderStatus === OrderStatus.REJECTED
  )
    return OrderFilter.CANCELLED;
  if (ACTIVE_STATUSES.has(orderStatus)) return OrderFilter.ACTIVE;

  throw new Error(`Unhandled OrderStatus: ${orderStatus}`);
}
