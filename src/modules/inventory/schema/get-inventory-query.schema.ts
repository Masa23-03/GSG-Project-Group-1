import {z} from 'zod';
import { GetInventoryQueryDto } from '../dto/query.dto/get-inventory-query.dto';

export const GetInventoryQuerySchema = z.object({
  page: z.preprocess((val) => Number(val ?? 1), z.number().min(1)).default(1),
  limit: z.preprocess((val) => Number(val ?? 10), z.number().min(1).max(100)).default(10),
  q: z.string().optional(),
  medicineId: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  isAvailable: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  lowStock: z.preprocess(
    (val) => (val === 'true' ? true : undefined),
    z.boolean().optional()
  ),
}) satisfies z.ZodType<GetInventoryQueryDto>;