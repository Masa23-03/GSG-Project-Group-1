import { z } from 'zod';
import { GetInventoryAdminQueryDto } from '../dto/query.dto/get-inventory-admin-query.dto';
export const GetInventoryAdminQuerySchema = z.object({
  pharmacyId: z.coerce.number().int().optional(),
  medicineId: z.coerce.number().int().optional(),
  isAvailable: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  includeDeleted: z.preprocess(
    (val) => (val === 'true' ? true : false), // Default to false if not provided
    z.boolean().default(false)
  ),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}) satisfies z.ZodType<GetInventoryAdminQueryDto>;