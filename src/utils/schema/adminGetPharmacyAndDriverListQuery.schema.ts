import { UserStatus, VerificationStatus } from '@prisma/client';
import { AdminBaseListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import z, { ZodType } from 'zod';
import { PaginationQuerySchema } from './pagination.schema.util';

//ADMIN: Get pharmacies and drivers schema
export const adminBaseListQuerySchema = z
  .object({
    verificationStatus: z
      .nativeEnum(VerificationStatus)
      .default(VerificationStatus.UNDER_REVIEW),

    userStatus: z.nativeEnum(UserStatus).optional(),

    q: z.string().trim().min(1).optional(),
  })
  .merge(PaginationQuerySchema);

export const adminBaseUpdateVerificationStatusSchema = z.object({
  verificationStatus: z.nativeEnum(VerificationStatus),
});
