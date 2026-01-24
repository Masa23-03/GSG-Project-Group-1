import { Prisma } from '@prisma/client';
import { adminPharmacyListQueryDto } from '../dto/pharmacy.dto';
import { buildAdminBaseWhere, extractId } from 'src/utils/util';
import { adminListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';

export type CityFilterType = Prisma.PharmacyWhereInput['city'];

export function buildAdminPharmacyWhere(
  query: adminListQueryDto,
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
