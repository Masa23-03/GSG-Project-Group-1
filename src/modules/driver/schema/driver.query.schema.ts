import z, { ZodType } from 'zod';
import { AvailabilityStatus } from '@prisma/client';
import { adminBaseListQuerySchema } from 'src/utils/schema/adminGetPharmacyAndDriverListQuery.schema';

//ADMIN: Get Drivers schema
export const adminDriverListQuerySchema = z
  .object({
    availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
  })
  .merge(adminBaseListQuerySchema)
  .strict();
