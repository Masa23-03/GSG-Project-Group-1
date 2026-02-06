import z, { ZodType } from 'zod';
import {
  PharmacyOrderFilter,
  PharmacyOrderQueryDtoType,

} from '../dto/request.dto/order.query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { SortOrder } from 'src/types/pagination.query';

export const pharmacyOrderQuerySchema = z
  .object({
    filter: z.nativeEnum(PharmacyOrderFilter).optional(),

    sortOrder: z.nativeEnum(SortOrder).optional(),

    q: z.string().trim().min(1).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict() satisfies ZodType<PharmacyOrderQueryDtoType>;
