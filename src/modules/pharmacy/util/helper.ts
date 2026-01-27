import { Prisma } from '@prisma/client';
import { adminPharmacyListQueryDto } from '../dto/pharmacy.dto';
import { buildAdminBaseWhere, extractId } from 'src/utils/util';
import { AdminListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { boolean } from 'zod';

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

  return nowMin > openMin && nowMin < closeMin;
}
