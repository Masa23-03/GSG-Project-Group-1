import { Prisma } from '@prisma/client';
import { PatientPharmaciesQueryDto } from '../dto/query.dto/patient.query.dto';
import { PatientPharmacyListResponseDto } from '../dto/response.dto/pateint-pharmacy.response.dto';
import {
  calculateDistanceKM,
  calculateDistanceKMOrNull,
  isPharmacyOpenNow,
} from './helper';

export type PatientPharmacyWithRelations = Prisma.PharmacyGetPayload<{
  select: {
    id: true;
    pharmacyName: true;

    city: {
      select: {
        id: true;
        name: true;
        cityDeliveryFee: true;
      };
    };
    address: true;
    latitude: true;
    longitude: true;
    coverImageUrl: true;
    workOpenTime: true;
    workCloseTime: true;
    user: { select: { profileImageUrl: true } };
  };
}>;

export function mapToPatientPharmacyList(
  pharmacy: PatientPharmacyWithRelations,
  query: PatientPharmaciesQueryDto,
): PatientPharmacyListResponseDto {
  //calculate distance in Km
  const distanceKm = calculateDistanceKMOrNull(
    query.lat,
    query.lng,
    pharmacy.latitude !== null ? Number(pharmacy.latitude) : undefined,
    pharmacy.longitude !== null ? Number(pharmacy.longitude) : undefined,
  );

  const deliveryFee = pharmacy.city.cityDeliveryFee?.standardFeeAmount
    ? Number(pharmacy.city.cityDeliveryFee.standardFeeAmount)
    : null;

  return {
    id: pharmacy.id,
    pharmacyName: pharmacy.pharmacyName,

    cityId: pharmacy.city.id,
    cityName: pharmacy.city.name,
    address: {
      address: pharmacy.address,
      latitude: pharmacy.latitude ? Number(pharmacy.latitude) : null,
      longitude: pharmacy.longitude ? Number(pharmacy.longitude) : null,
    },
    distanceKm: distanceKm,
    eta: null,
    deliveryFee: deliveryFee,
    coverImageUrl: pharmacy.coverImageUrl ?? null,
    profileImageUrl: pharmacy.user.profileImageUrl ?? null,
    isOpenNow: isPharmacyOpenNow(pharmacy.workOpenTime, pharmacy.workCloseTime),
  };
}
