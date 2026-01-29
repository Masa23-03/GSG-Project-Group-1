import z, { ZodType } from 'zod';
import { RegisterPharmacyDTO } from 'src/modules/auth/dto/auth.register.dto';
import { baseRegisterSchema } from './patient.validation.schema';
import { urlSchema } from 'src/utils/zod.helper';

export const pharmacyValidationSchema = baseRegisterSchema
  .extend({
    pharmacyName: z.string().trim().min(2).max(255),
    licenseNumber: z.string().trim().min(2).max(255),
    licenseDocUrl: urlSchema.optional(),
    cityId: z.coerce.number().int().positive(),

    address: z.string().trim().min(2),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
  })
  .strict() satisfies ZodType<RegisterPharmacyDTO>;
