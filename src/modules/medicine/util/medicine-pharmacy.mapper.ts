import { Prisma } from '@prisma/client';
import { PatientMedicinePharmacyItemDto } from '../dto/medicine-pahrmacies.dto';
import {
  calculateDistanceKMOrNull,
  isPharmacyOpenNow,
} from 'src/modules/pharmacy/util/helper';

export const patientMedicinePharmacySelect = {
  sellPrice: true,
  stockQuantity: true,
  pharmacy: {
    select: {
      id: true,
      pharmacyName: true,
      cityId: true,
      city: {
        select: {
          name: true,
          cityDeliveryFee: { select: { standardFeeAmount: true } },
        },
      },
      address: true,
      latitude: true,
      longitude: true,
      coverImageUrl: true,
      workOpenTime: true,
      workCloseTime: true,
      user: { select: { profileImageUrl: true, status: true } },
      verificationStatus: true,
    },
  },
} satisfies Prisma.InventoryItemSelect;

export type PatientMedicinePharmacyWithRelations =
  Prisma.InventoryItemGetPayload<{
    select: typeof patientMedicinePharmacySelect;
  }>;

export function mapToPatientMedicinePharmacyItem(
  row: PatientMedicinePharmacyWithRelations,
  patientLat?: number,
  patientLng?: number,
): PatientMedicinePharmacyItemDto {
  const p = row.pharmacy;
  const distanceKm = calculateDistanceKMOrNull(
    patientLat,
    patientLng,
    p.latitude !== null ? Number(p.latitude) : undefined,
    p.longitude !== null ? Number(p.longitude) : undefined,
  );
  const deliveryFee = p.city.cityDeliveryFee
    ? Number(p.city.cityDeliveryFee.standardFeeAmount)
    : null;
  return {
    pharmacyId: p.id,
    pharmacyName: p.pharmacyName,
    cityId: p.cityId,
    cityName: p.city.name,

    address: {
      address: p.address ?? null,
      latitude: p.latitude !== null ? Number(p.latitude) : null,
      longitude: p.longitude !== null ? Number(p.longitude) : null,
    },

    distanceKm,
    eta: null,

    sellPrice: Number(row.sellPrice),
    stockQuantity: row.stockQuantity,

    deliveryFee,
    coverImageUrl: p.coverImageUrl ?? null,
    profileImageUrl: p.user.profileImageUrl ?? null,

    isOpenNow: isPharmacyOpenNow(p.workOpenTime, p.workCloseTime),
  };
}
