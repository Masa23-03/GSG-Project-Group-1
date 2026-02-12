import { Prisma, UserStatus, VerificationStatus } from '@prisma/client';
import { buildAdminBaseWhere, extractId } from 'src/utils/util';
import { AdminListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { PatientPharmaciesQueryDto } from '../dto/query.dto/patient.query.dto';

export type CityFilterType = Prisma.PharmacyWhereInput['city'];

export function buildAdminPharmacyWhere(
  query: AdminListQueryDto,
): Prisma.PharmacyWhereInput {
  const { and, q, extractedId } = buildAdminBaseWhere(query);

  if (q) {
    and.push({
      OR: [
        ...(extractedId ? [{ id: extractedId }, { userId: extractedId }] : []),
        { pharmacyName: { contains: q } },
        { licenseNumber: { contains: q } },
        { user: { phoneNumber: { contains: q } } },
        { user: { email: { contains: q } } },
        { city: { name: { contains: q } } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

export function toHHmm(value: Date | null): string | null {
  if (!value) return null;
  const hour = value.getHours().toString().padStart(2, '0');
  const minute = value.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minute}`;
}
function calculateMinutesSinceMidnight(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function isPharmacyOpenNow(
  openTime: Date | null,
  closeTime: Date | null,
  now = new Date(),
): boolean {
  if (!openTime || !closeTime) return false;
  const nowMin = calculateMinutesSinceMidnight(now);
  const openMin = calculateMinutesSinceMidnight(openTime);
  const closeMin = calculateMinutesSinceMidnight(closeTime);

  if (openMin < closeMin) return nowMin >= openMin && nowMin < closeMin;

  return nowMin >= openMin || nowMin < closeMin;
}

export function calculateDistanceKM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRadius = (d: number) => (d * Math.PI) / 180;
  const distanceLat = toRadius(lat2 - lat1);
  const distanceLng = toRadius(lng2 - lng1);
  const a =
    Math.sin(distanceLat / 2) ** 2 +
    Math.cos(toRadius(lat1)) *
      Math.cos(toRadius(lat2)) *
      Math.sin(distanceLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
export function calculateDistanceKMOrNull(
  patientLat?: number,
  patientLng?: number,
  pharmacyLat?: number,
  pharmacyLng?: number,
): number | null {
  if (patientLat === undefined || patientLng === undefined) return null;
  if (pharmacyLat === null || pharmacyLat === undefined) return null;
  if (pharmacyLng === null || pharmacyLng === undefined) return null;

  return calculateDistanceKM(patientLat, patientLng, pharmacyLat, pharmacyLng);
}

export function sortByDistanceThenName<
  T extends { distanceKm: number | null; pharmacyName: string },
>(items: T[]): T[] {
  return items.sort((a, b) => {
    const ad = a.distanceKm;
    const bd = b.distanceKm;

    if (ad === null && bd === null)
      return a.pharmacyName.localeCompare(b.pharmacyName);
    if (ad === null) return 1; // nulls last
    if (bd === null) return -1;

    if (ad !== bd) return ad - bd;
    return a.pharmacyName.localeCompare(b.pharmacyName);
  });
}

export function applyRadiusFilter<T extends { distanceKm: number | null }>(
  items: T[],
  radiusKm?: number,
): T[] {
  if (radiusKm === undefined) return items;
  return items.filter((x) => x.distanceKm === null || x.distanceKm <= radiusKm);
}

export function buildPatientPharmacyWhere(
  query: PatientPharmaciesQueryDto,
): Prisma.PharmacyWhereInput {
  const and: Prisma.PharmacyWhereInput[] = [];
  and.push({ verificationStatus: VerificationStatus.VERIFIED });
  and.push({ user: { status: UserStatus.ACTIVE } });
  //search by pharmacy name
  const q = query.q?.trim();
  if (q) {
    and.push({
      pharmacyName: {
        contains: q,
      },
    });
  }

  //city filtering
  if (query.cityId !== undefined) and.push({ cityId: query.cityId });

  return and.length ? { AND: and } : {};
}
