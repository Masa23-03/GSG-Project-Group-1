import { PaymentMethod, Prisma } from '@prisma/client';
import { DriverDeliveryDetailsResponseDto } from '../dto/response/details.response.dto';
import { mapDeliveryListItem } from './list.mapper';
import { buildMedicineDisplayNameHelper } from 'src/modules/order/util/medicineDisplayName.helper';

const deliveryDetailsSelect = {
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
      notes: true,
      currency: true,
      orderCity: {
        select: {
          id: true,
          name: true,
        },
      },
      patient: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          email: true,
          profileImageUrl: true,
        },
      },
      payment: {
        select: {
          method: true,
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
      pharmacyOrderItems: {
        select: {
          quantity: true,
          inventoryItem: {
            select: {
              medicineId: true,
              medicine: {
                select: {
                  id: true,
                  genericName: true,
                  brandName: true,
                  strengthValue: true,
                  strengthUnit: true,
                  dosageForm: true,
                  medicineImages: {
                    take: 1,
                    select: { url: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.DeliverySelect;

type DeliveryDetailsSelectType = Prisma.DeliveryGetPayload<{
  select: typeof deliveryDetailsSelect;
}>;

export function mapToDeliveryDetails(
  delivery: DeliveryDetailsSelectType,
): DriverDeliveryDetailsResponseDto {
  return {
    ...mapDeliveryListItem(delivery),
    paymentMethod: delivery.order.payment?.method ?? PaymentMethod.COD,
    patient: {
      name: delivery.order.patient.name,
      email: delivery.order.patient.email,
      phoneNumber: delivery.order.patient.phoneNumber,
      profileImageUrl: delivery.order.patient.profileImageUrl ?? null,
    },
    deliveryInstructions: delivery.order.notes ?? null,
    pharmacies: delivery.pharmacyOrders.map((p) => ({
      phoneNumber: p.pharmacy.user.phoneNumber,
      pharmacyId: p.pharmacy.id,
      pharmacyName: p.pharmacy.pharmacyName,
      pharmacyLatitude: p.pharmacy.latitude?.toNumber() ?? null,
      pharmacyLongitude: p.pharmacy.longitude?.toNumber() ?? null,
      pharmacyAddressText: p.pharmacy.address ?? null,
      profileImageUrl: p.pharmacy.user.profileImageUrl ?? null,
      items: p.pharmacyOrderItems.map((item) => ({
        medicineId: item.inventoryItem.medicineId,
        quantity: item.quantity,
        imageUrl: item.inventoryItem.medicine.medicineImages[0]?.url ?? null,
        displayName: buildMedicineDisplayNameHelper(
          item.inventoryItem.medicine,
        ),
      })),
    })),
  };
}
