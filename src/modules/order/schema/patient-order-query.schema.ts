import z, { ZodType } from 'zod';
import {
  OrderFilter,
  PatientOrderQueryDtoType,
} from '../dto/request.dto/order.query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { SortOrder } from 'src/types/pagination.query';

export const patientOrderQuerySchema = z
  .object({
    filter: z.nativeEnum(OrderFilter).optional(),
    orderId: z.coerce.number().int().positive().optional(),
    pharmacyId: z.coerce.number().int().positive().optional(),
    pharmacyName: z.string().trim().min(1).optional(),
    sortOrder: z.nativeEnum(SortOrder).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict() satisfies ZodType<PatientOrderQueryDtoType>;
