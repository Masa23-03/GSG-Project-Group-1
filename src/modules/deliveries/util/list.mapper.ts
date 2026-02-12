import { Prisma } from '@prisma/client';
import { DriverAvailableDeliveriesListItemDto } from '../dto/response/list.response.dto';

export const deliveryAvailableListSelect = {
  id: true,
  orderId: true,
  createdAt: true,
  order: {
    select: {
      deliveryAddressLine: true,
      deliveryLatitude: true,
      deliveryLongitude: true,
      deliveryFeeAmount: true,
      pickupCityId: true,
      currency: true,
      orderCity: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  pharmacyOrders: {
    orderBy: [{ pharmacy: { pharmacyName: 'asc' } }, { id: 'asc' }],
    select: {
      id: true,
      pharmacy: {
        select: {
          id: true,
          pharmacyName: true,
          latitude: true,
          longitude: true,
          address: true,
          user: {
            select: {
              phoneNumber: true,
              profileImageUrl: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.DeliverySelect;

export type DeliveryAvailableListSelectType = Prisma.DeliveryGetPayload<{
  select: typeof deliveryAvailableListSelect;
}>;
export function mapDeliveryListItem(
  delivery: DeliveryAvailableListSelectType,
): DriverAvailableDeliveriesListItemDto {
  return {
    deliveryId: delivery.id,
    orderId: delivery.orderId,
    createdAt: delivery.createdAt.toISOString(),
    cityId: delivery.order.pickupCityId,
    cityName: delivery.order.orderCity?.name ?? '',
    currency: delivery.order.currency,
    deliveryAddressLine: delivery.order.deliveryAddressLine,
    deliveryFee: delivery.order.deliveryFeeAmount.toNumber(),
    deliveryLatitude: delivery.order.deliveryLatitude?.toNumber() ?? null,
    deliveryLongitude: delivery.order.deliveryLongitude?.toNumber() ?? null,
    pharmacies: delivery.pharmacyOrders.map((p) => ({
      pharmacyOrderId: p.id,
      pharmacyId: p.pharmacy.id,
      pharmacyName: p.pharmacy.pharmacyName,
      pharmacyLatitude: p.pharmacy.latitude?.toNumber() ?? null,
      pharmacyLongitude: p.pharmacy.longitude?.toNumber() ?? null,
      pharmacyAddressText: p.pharmacy.address ?? null,
      phoneNumber: p.pharmacy.user.phoneNumber,
      profileImageUrl: p.pharmacy.user.profileImageUrl ?? null,
    })),
  };
}
