import { z, ZodType } from 'zod';
import { GetInventoryAdminQueryDto } from '../dto/query.dto/get-inventory-admin-query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { zBoolQuery, zIntQuery } from './get-inventory-query.schema';

export const GetInventoryAdminQuerySchema = z
  .object({
    pharmacyId: zIntQuery,
    medicineId: zIntQuery,
    isAvailable: zBoolQuery,
    includeDeleted: zBoolQuery,
  })
  .merge(PaginationQuerySchema)
  .strict() satisfies ZodType<GetInventoryAdminQueryDto>;
