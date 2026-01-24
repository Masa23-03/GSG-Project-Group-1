import { Prisma } from '@prisma/client';
import { adminDriverListQueryDto } from '../dto/driver.dto.';
import { AdminDriverListQueryDto } from '../dto/query.dto/get-driver-dto';
import { buildAdminBaseWhere } from 'src/utils/util';

export function buildAdminDriverWhere(
  query: adminDriverListQueryDto,
): Prisma.DriverWhereInput {
  const { and, q, extractedId } = buildAdminBaseWhere(query);
  const driverAnd: Prisma.DriverWhereInput[] = and as any;
  if (query.availability)
    driverAnd.push({ availabilityStatus: query.availability });
  if (q) {
    driverAnd.push({
      OR: [
        ...(extractedId ? [{ id: extractedId }, { userId: extractedId }] : []),
        { user: { phoneNumber: { contains: q } } },
        { user: { email: { contains: q } } },
        { user: { name: { contains: q } } },
        { vehicleName: { contains: q } },
        { vehiclePlate: { contains: q } },
        { licenseNumber: { contains: q } },
      ],
    });
  }
  return driverAnd.length ? { AND: driverAnd } : {};
}
