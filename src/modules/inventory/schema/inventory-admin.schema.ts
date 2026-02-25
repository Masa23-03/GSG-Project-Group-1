import { z, ZodType } from 'zod';
import { GetInventoryAdminQueryDto } from '../dto/query.dto/get-inventory-admin-query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { BooleanFromStringSchema } from 'src/modules/medicine/schema/query.medicine.shcema';
import { UserStatus } from '@prisma/client';
import { zIdQuery } from './get-inventory-query.schema';

export const GetInventoryAdminQuerySchema = z
  .object({
    pharmacyId: zIdQuery,
    medicineId: zIdQuery,
    isAvailable: BooleanFromStringSchema.optional(),
    includeDeleted: BooleanFromStringSchema.optional(),
    pharmacyUserStatus: z.nativeEnum(UserStatus).optional(),
    medicineIsActive: BooleanFromStringSchema.optional(),
  })
  .merge(PaginationQuerySchema)
  .strict() satisfies ZodType<GetInventoryAdminQueryDto>;
