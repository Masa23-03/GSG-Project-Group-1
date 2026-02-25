import { z } from 'zod';
import { GetInventoryQueryDto } from '../dto/query.dto/get-inventory-query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { StockStatus } from '../dto/response.dto/InventoryListItem.dto';
import { qSchema } from 'src/modules/medicine/schema/query.medicine.shcema';

export const zIdQuery = z.coerce
  .number()
  .int()
  .positive()
  .max(2_147_483_647)
  .optional();

export const GetInventoryQuerySchema = z
  .object({
    q: qSchema,
    medicineId: zIdQuery,
    stockStatus: z.nativeEnum(StockStatus).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict() satisfies z.ZodType<GetInventoryQueryDto>;
