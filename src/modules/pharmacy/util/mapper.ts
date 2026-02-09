import { Prisma } from '@prisma/client';
import { PatientPharmaciesQueryDto } from '../dto/query.dto/patient.query.dto';
import { PatientPharmacyListResponseDto } from '../dto/response.dto/pateint-pharmacy.response.dto';
import { calculateDistanceKMOrNull, isPharmacyOpenNow } from './helper';

export const patientPharmacySelect = {
  id: true,
  pharmacyName: true,

  cityId: true,
  city: {
    select: {
      id: true,
      name: true,
      cityDeliveryFee: {
        select: { standardFeeAmount: true },
      },
    },
  },

  address: true,
  latitude: true,
  longitude: true,
  coverImageUrl: true,
  workOpenTime: true,
  workCloseTime: true,

  user: { select: { profileImageUrl: true, status: true } },
} satisfies Prisma.PharmacySelect;

export type PatientPharmacyWithRelations = Prisma.PharmacyGetPayload<{
  select: typeof patientPharmacySelect;
}>;

export function mapToPatientPharmacyList(
  pharmacy: PatientPharmacyWithRelations,
  query: PatientPharmaciesQueryDto,
): PatientPharmacyListResponseDto {
  const distanceKm = calculateDistanceKMOrNull(
    query.lat,
    query.lng,
    pharmacy.latitude !== null ? Number(pharmacy.latitude) : undefined,
    pharmacy.longitude !== null ? Number(pharmacy.longitude) : undefined,
  );

  const deliveryFee = pharmacy.city.cityDeliveryFee
    ? Number(pharmacy.city.cityDeliveryFee.standardFeeAmount)
    : null;

  return {
    id: pharmacy.id,
    pharmacyName: pharmacy.pharmacyName,

    cityId: pharmacy.cityId,
    cityName: pharmacy.city.name,

    address: {
      address: pharmacy.address ?? null,
      latitude: pharmacy.latitude !== null ? Number(pharmacy.latitude) : null,
      longitude:
        pharmacy.longitude !== null ? Number(pharmacy.longitude) : null,
    },

    distanceKm,
    eta: null,
    deliveryFee,

    coverImageUrl: pharmacy.coverImageUrl ?? null,
    profileImageUrl: pharmacy.user.profileImageUrl ?? null,

    isOpenNow: isPharmacyOpenNow(pharmacy.workOpenTime, pharmacy.workCloseTime),
  };
}
