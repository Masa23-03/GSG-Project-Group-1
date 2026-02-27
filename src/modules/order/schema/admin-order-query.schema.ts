import z, { ZodType } from 'zod';
import { GetAdminOrderQueryDtoType } from '../dto/request.dto/order.query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { OrderStatus } from '@prisma/client';

export const getAdminOrderQuerySchema = z
  .object({
    status: z.nativeEnum(OrderStatus).optional(),
    q: z.string().trim().min(1).max(100).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict() satisfies ZodType<GetAdminOrderQueryDtoType>;
