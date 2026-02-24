import { z } from 'zod';
import { MedicineStatus } from '@prisma/client';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { safeText } from 'src/utils/zod.helper';

// const MedicineStatusWithoutRejected = removeFields( MedicineStatus, ['REJECTED'])

const BooleanFromStringSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  return value;
}, z.boolean());
const qSchema = safeText({ min: 0, max: 100, mode: 'generic' })
  .optional()
  .transform((v) => {
    if (v == null) return undefined;
    const s = v.trim();
    return s.length ? s : undefined;
  });
export const SearchQuerySchema = z
  .object({
    q: qSchema,
    categoryId: z.coerce.number().int().positive().optional(),
  })
  .merge(PaginationQuerySchema)
  .strict();
export const PatientListQuerySchema = z
  .object({
    q: qSchema,
    categoryId: z.coerce.number().int().positive().optional(),

    requiresPrescription: BooleanFromStringSchema.optional(),
    onlyAvailable: BooleanFromStringSchema.optional().default(false),

    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
  })

  .merge(PaginationQuerySchema)
  .strict()
  .refine(
    (d) =>
      d.minPrice === undefined ||
      d.maxPrice === undefined ||
      d.minPrice <= d.maxPrice,
    { message: 'minPrice must be <= maxPrice', path: ['minPrice'] },
  );

//* Admin list query
export const AdminListQuerySchema = SearchQuerySchema.extend({
  status: z.nativeEnum(MedicineStatus).optional(),
  isActive: BooleanFromStringSchema.optional(),
}).strict();

//* Pharmacy requests list query
export const PharmacyRequestsListQuerySchema = z
  .object({
    status: z.nativeEnum(MedicineStatus).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict();
