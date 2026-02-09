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

    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),

    radiusKm: z.coerce.number().positive().optional(),
    cityId: z.coerce.number().int().positive().optional(),
  })
  .merge(PaginationQuerySchema)
  .superRefine((val, ctx) => {
    const hasLng = val.lng !== undefined;
    const hasLat = val.lat !== undefined;
    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'lat and lng must be provided together',
        path: hasLat ? ['lng'] : ['lat'],
      });
    }
    if (val.radiusKm !== undefined && !(hasLat && hasLng)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'radiusKm can be used only when lat/lng are provided',
        path: ['radiusKm'],
      });
    }
    if (
      val.scope === PharmacyScope.nearby &&
      !(hasLat && hasLng) &&
      val.cityId === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'cityId is required when scope=nearby and lat/lng are not provided',
        path: ['cityId'],
      });
    }
  }) satisfies ZodType<PatientPharmaciesQueryDtoType>;
