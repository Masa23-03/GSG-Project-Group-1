import z, { ZodType } from 'zod';
import { RegisterPharmacyDTO } from 'src/modules/auth/dto/auth.register.dto';
import { baseRegisterSchema } from './patient.validation.schema';
import { safeText, urlSchema } from 'src/utils/zod.helper';

export const pharmacyValidationSchema = baseRegisterSchema
  .extend({
    pharmacyName: safeText({ min: 2, max: 255, mode: 'title' }),
    licenseNumber: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/^[A-Za-z0-9\-\/]+$/, {
        message: 'Invalid license number format',
      }),
    licenseDocUrl: urlSchema.optional(),
    cityId: z.coerce.number().int().positive(),

    address: safeText({ min: 2, max: 255, mode: 'address' }),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
  })
  .strict() satisfies ZodType<RegisterPharmacyDTO>;
