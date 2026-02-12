import { DeliveryStatus } from '@prisma/client';
import { mapPharmacyOrder, OrderWithRelations } from './response.map';
import { PatientOrderDetailsResponseDto } from '../dto/response.dto/patient-get-order.response.dto';

export function mapToPatientOrderDetails(
  order: OrderWithRelations & {
    delivery: null | {
      id: number;
      status: DeliveryStatus;
      acceptedAt: Date | null;
      deliveredAt: Date | null;
      driver: null | {
        id: number;
        user: { name: string; phoneNumber: string };
      };
    };
  },
): PatientOrderDetailsResponseDto {
  //address fields
  const addressText = order.deliveryAddressLine;
  const lng = order.deliveryLongitude ? Number(order.deliveryLongitude) : null;
  const lat = order.deliveryLatitude ? Number(order.deliveryLatitude) : null;

  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    status: order.status,
    subAmount: Number(order.subtotalAmount),
    totalAmount: Number(order.totalAmount),
    deliveryFee: Number(order.deliveryFeeAmount),
    currency: order.currency,
    deliveryAddress: {
      addressText: addressText,
      lat: lat,
      lng: lng,
    },
    pharmacyOrders: order.pharmacyOrders.map((p) => ({
      ...mapPharmacyOrder(p),
      rejectedAt: p.rejectedAt ? p.rejectedAt.toISOString() : null,
      rejectionReason: p.rejectionReason ?? null,
    })),
    delivery: order.delivery
      ? {
          id: order.delivery.id,
          status: order.delivery.status,
          acceptedAt: order.delivery.acceptedAt
            ? order.delivery.acceptedAt.toISOString()
            : null,
          deliveredAt: order.delivery.deliveredAt
            ? order.delivery.deliveredAt.toISOString()
            : null,
          driver: order.delivery.driver
            ? {
                id: order.delivery.driver.id,
                name: order.delivery.driver.user.name,
                phoneNumber: order.delivery.driver.user.phoneNumber,
              }
            : null,
        }
      : null,
  };
}
