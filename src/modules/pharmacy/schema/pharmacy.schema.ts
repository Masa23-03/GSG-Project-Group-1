import { adminBaseListQuerySchema } from 'src/utils/schema/adminGetPharmacyAndDriverListQuery.schema';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import z, { ZodType } from 'zod';
import {
  PatientPharmaciesQueryDtoType,
  PharmacyScope,
} from '../dto/query.dto/patient.query.dto';

//ADMIN: Get pharmacies schema
export const adminPharmacyListQuerySchema = adminBaseListQuerySchema;

//Patient: Get pharmacies
export const patientPharmacyListQuerySchema = z
  .object({
    scope: z.nativeEnum(PharmacyScope).optional(),
    q: z
      .string()
      .trim()
      .min(1)
      .optional()
      .transform((v) => (v === '' ? undefined : v)),

    radiusKm: z.coerce.number().positive().optional(),
    cityId: z.coerce.number().int().positive().optional(),
  })
  .merge(
    PaginationQuerySchema,
  ) satisfies ZodType<PatientPharmaciesQueryDtoType>;
