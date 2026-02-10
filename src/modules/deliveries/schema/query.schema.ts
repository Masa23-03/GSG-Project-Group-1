import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import z, { ZodType } from 'zod';
import { SortOrder } from 'src/modules/order/dto/request.dto/order.query.dto';

export const driverDeliveriesListQuerySchema = z
  .object({
    sortOrder: z.nativeEnum(SortOrder).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict();
