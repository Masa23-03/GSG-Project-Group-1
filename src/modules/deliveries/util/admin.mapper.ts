import { Prisma } from '@prisma/client';
import { AdminDeliveryListItemDto } from '../dto/response/admin-deliveries.response.dto';

export const adminDeliveryListSelect = {
  id: true,
  orderId: true,
  status: true,
  createdAt: true,
  acceptedAt: true,
  deliveredAt: true,
  driver: {
    select: {
      id: true,
      vehicleName: true,
      vehiclePlate: true,
      availabilityStatus: true,
      verificationStatus: true,
      user: {
        select: {
          name: true,
          phoneNumber: true,
        },
      },
    },
  },
} satisfies Prisma.DeliverySelect;

export type AdminDeliveryListSelectType = Prisma.DeliveryGetPayload<{
  select: typeof adminDeliveryListSelect;
}>;

export function mapAdminDeliveryListItem(
  row: AdminDeliveryListSelectType,
): AdminDeliveryListItemDto {
  return {
    id: row.id,
    orderId: row.orderId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    deliveredAt: row.deliveredAt?.toISOString() ?? null,
    driver: row.driver
      ? {
          id: row.driver.id,
          name: row.driver.user.name,
          phoneNumber: row.driver.user.phoneNumber,
          vehicleName: row.driver.vehicleName,
          vehiclePlate: row.driver.vehiclePlate,
          availabilityStatus: row.driver.availabilityStatus,
          verificationStatus: row.driver.verificationStatus,
        }
      : null,
    earning: null,
    rating: null,
  };
}
