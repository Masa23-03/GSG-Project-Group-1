import { PharmacyOrderStatus, Prisma } from '@prisma/client';
import {
  PharmacyOrderFilter,
  PharmacyOrderQueryDto,
} from '../dto/request.dto/order.query.dto';

function mapFilterToStatus(
  filter: PharmacyOrderFilter,
): PharmacyOrderStatus[] | null {
  if (!filter || filter === PharmacyOrderFilter.ALL) return null;
  switch (filter) {
    case PharmacyOrderFilter.NEW:
      return [
        PharmacyOrderStatus.PENDING,
        PharmacyOrderStatus.ACCEPTED,
        PharmacyOrderStatus.PREPARING,
        PharmacyOrderStatus.READY_FOR_PICKUP,
      ];
    case PharmacyOrderFilter.DELIVERED:
      return [PharmacyOrderStatus.COMPLETED];
    case PharmacyOrderFilter.PAST:
      return [
        PharmacyOrderStatus.REJECTED,
        PharmacyOrderStatus.CANCELLED,
        PharmacyOrderStatus.COMPLETED,
        PharmacyOrderStatus.PICKED_UP,
      ];

    default:
      return null;
  }
}
export function buildPharmacyOrderWhereStatement(
  pharmacyId: number,

  query: PharmacyOrderQueryDto,
): Prisma.PharmacyOrderWhereInput {
  const and: Prisma.PharmacyOrderWhereInput[] = [{ pharmacyId }];
  if (query.filter) {
    const statuses = mapFilterToStatus(query.filter);
    if (statuses) and.push({ status: { in: statuses } });
  }

  const q = query.q?.trim();
  if (q) {
    const qNumber = /^\d+$/.test(q) ? Number(q) : null;

    const OR: Prisma.PharmacyOrderWhereInput[] = [
      { order: { patient: { name: { contains: q } } } },

      {
        pharmacyOrderItems: {
          some: {
            inventoryItem: {
              medicine: {
                OR: [
                  { genericName: { contains: q } },
                  { brandName: { contains: q } },
                ],
              },
            },
          },
        },
      },
    ];
    if (qNumber !== null) {
      OR.push(
        {
          id: qNumber,
        },

        { orderId: qNumber },
        { order: { patientId: qNumber } },
      );
    }
    and.push({ OR });
  }
  return and.length ? { AND: and } : {};
}
