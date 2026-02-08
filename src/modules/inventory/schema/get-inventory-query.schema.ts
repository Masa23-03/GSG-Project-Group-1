import {z} from 'zod';
import { GetInventoryQueryDto } from '../dto/query.dto/get-inventory-query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';

export const GetInventoryQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  medicineId: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  isAvailable: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  lowStock: z.preprocess(
    (val) => (val === 'true' ? true : undefined),
    z.boolean().optional()
  ),
}).merge(PaginationQuerySchema).strict() satisfies z.ZodType<GetInventoryQueryDto>;
