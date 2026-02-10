import { OrderStatus, Prisma } from '@prisma/client';
import {
  OrderFilter,
  PatientOrderQueryDto,
} from '../dto/request.dto/order.query.dto';
import { buildCreatedAtOrderBy } from 'src/types/pagination.query';
export const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.ACCEPTED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.PARTIALLY_ACCEPTED,
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
] as const;

export function buildOrderWhereStatement(
  patientId: number,
  query: PatientOrderQueryDto,
): Prisma.OrderWhereInput {
  const and: Prisma.OrderWhereInput[] = [{ patientId }];
  if (query.orderId) and.push({ id: query.orderId });
  if (query.pharmacyId)
    and.push({ pharmacyOrders: { some: { pharmacyId: query.pharmacyId } } });
  if (query.pharmacyName)
    and.push({
      pharmacyOrders: {
        some: { pharmacy: { pharmacyName: { contains: query.pharmacyName } } },
      },
    });
  const filter = query.filter ?? OrderFilter.ALL;
  if (filter === OrderFilter.DELIVERED) {
    and.push({ status: OrderStatus.DELIVERED });
  } else if (filter === OrderFilter.CANCELLED) {
    and.push({ status: { in: [OrderStatus.CANCELLED, OrderStatus.REJECTED] } });
  } else if (filter === OrderFilter.ACTIVE) {
    and.push({
      status: {
        in: ACTIVE_STATUSES,
      },
    });
  }

  return { AND: and };
}
