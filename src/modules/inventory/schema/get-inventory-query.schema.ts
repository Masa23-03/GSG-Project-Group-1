import { z } from 'zod';
import { GetInventoryQueryDto } from '../dto/query.dto/get-inventory-query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { StockStatus } from '../dto/response.dto/InventoryListItem.dto';

export const zIntQuery = z.string().regex(/^\d+$/).transform(Number).optional();
export const GetInventoryQuerySchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    medicineId: zIntQuery,
    stockStatus: z.nativeEnum(StockStatus).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict() satisfies z.ZodType<GetInventoryQueryDto>;
