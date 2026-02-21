import { UserStatus, VerificationStatus } from '@prisma/client';
import z from 'zod';
import { PaginationQuerySchema } from './pagination.schema.util';

//ADMIN: Get pharmacies and drivers schema
export const adminBaseListQuerySchema = z
  .object({
    verificationStatus: z.nativeEnum(VerificationStatus).optional(),

    userStatus: z.nativeEnum(UserStatus).optional(),

    q: z.string().trim().min(1).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict();

export const adminBaseUpdateVerificationStatusSchema = z
  .object({
    verificationStatus: z.nativeEnum(VerificationStatus),
  })
  .strict();
