import { z } from 'zod';
import { GetInventoryAdminQueryDto } from '../dto/query.dto/get-inventory-admin-query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';

export const GetInventoryAdminQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  pharmacyId: z.coerce.number().int().optional(),
  medicineId: z.coerce.number().int().optional(),
  isAvailable: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  includeDeleted: z.preprocess(
    (val) => (val === 'true'), 
    z.boolean().default(false)
  ),

}).merge(PaginationQuerySchema).strict() satisfies z.ZodType<GetInventoryAdminQueryDto>;