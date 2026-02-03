import { Prisma } from '@prisma/client';
import {
  PatientOrderQueryDto,
  SortOrder,
} from '../dto/request.dto/order.query.dto';

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
  return { AND: and };
}

export function buildOrderOrderBy(
  query: PatientOrderQueryDto,
): Prisma.OrderOrderByWithRelationInput {
  return { createdAt: query.sortOrder === SortOrder.ASC ? 'asc' : 'desc' };
}
