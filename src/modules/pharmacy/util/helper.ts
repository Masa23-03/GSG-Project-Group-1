import { Prisma } from '@prisma/client';
import { adminPharmacyListQueryDto } from '../dto/pharmacy.dto';
import { extractId } from 'src/utils/util';

export type CityFilterType = Prisma.PharmacyWhereInput['city'];

export function buildAdminPharmacyWhere(
  query: adminPharmacyListQueryDto,
): Prisma.PharmacyWhereInput {
  const and: Prisma.PharmacyWhereInput[] = [];
  if (query.status) and.push({ verificationStatus: query.status });
  if (query.userStatus) and.push({ user: { status: query.userStatus } });
  if (query.q) {
    const q = query.q;
    const extractedId = extractId(q);
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
