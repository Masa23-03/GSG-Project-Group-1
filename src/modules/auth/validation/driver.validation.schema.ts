import z, { ZodType } from 'zod';
import { RegisterDriverDTO } from 'src/modules/auth/dto/auth.register.dto';
import { safeText, urlSchema } from 'src/utils/zod.helper';
import { baseRegisterSchema } from './patient.validation.schema';

export const driverValidationSchema = baseRegisterSchema
  .extend({
    licenseDocUrl: urlSchema,
    vehicleName: safeText({ min: 1, max: 255, mode: 'title' }),
    vehiclePlate: safeText({ min: 1, max: 255, mode: 'title' }),
  })
  .strict() satisfies ZodType<RegisterDriverDTO>;
