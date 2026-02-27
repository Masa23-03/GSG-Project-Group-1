import z from 'zod';
import { DeliveryStatus } from '@prisma/client';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';

export const adminDeliveriesListQuerySchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    status: z.nativeEnum(DeliveryStatus).optional(),
    driverId: z.coerce.number().int().positive().optional(),
  })
  .merge(PaginationQuerySchema)
  .strict();
