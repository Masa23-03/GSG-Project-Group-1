import { SortOrder } from 'src/types/pagination.query';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import z, { ZodType } from 'zod';

export const driverDeliveriesListQuerySchema = z
  .object({
    sortOrder: z.nativeEnum(SortOrder).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict();
