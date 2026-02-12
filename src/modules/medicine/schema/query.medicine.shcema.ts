import { z } from 'zod';
import { MedicineStatus } from '@prisma/client';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';

// const MedicineStatusWithoutRejected = removeFields( MedicineStatus, ['REJECTED'])

const BooleanFromStringSchema = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

export const SearchQuerySchema = z
  .object({
    q: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
  })
  .merge(PaginationQuerySchema)
  .strict();

//* Admin list query
export const AdminListQuerySchema = SearchQuerySchema.extend({
  status: z.nativeEnum(MedicineStatus).optional(),
  isActive: BooleanFromStringSchema.optional(),
}).strict();

//* Pharmacy requests list query
export const PharmacyRequestsListQuerySchema = z
  .object({
    status: z.nativeEnum(MedicineStatus).optional(),

    //! REJECTED status >> pharmacy will be able to see it ?
  })
  .merge(PaginationQuerySchema)
  .strict();
