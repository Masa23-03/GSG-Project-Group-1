import z, { ZodType } from 'zod';
import { AdminDriverListQueryDto } from '../dto/query.dto/get-driver-dto';
import { AvailabilityStatus } from '@prisma/client';
import { adminBaseListQuerySchema } from 'src/utils/schema/adminGetPharmacyAndDriverListQuery.schema';

//ADMIN: Get Drivers schema
export const adminDriverListQuerySchema = z
  .object({
    availability: z.nativeEnum(AvailabilityStatus).optional(),
  })
  .merge(adminBaseListQuerySchema);
