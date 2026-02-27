import z from 'zod';
import { UserStatus } from '@prisma/client';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';

export const adminUserListQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(100).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict();
