import z, { ZodType } from 'zod';
import { UpdateMyDriverDtoType } from '../dto/request.dto/profile.dto';
import { updateBaseUserProfileSchema } from 'src/modules/user/schema/profile.schema';
import { safeText } from 'src/utils/zod.helper';
const vehiclePlateSchema = safeText({ min: 1, max: 50, mode: 'title' }).refine(
  (v) => /^[A-Za-z0-9\- ]+$/.test(v),
  {
    message: 'vehiclePlate format invalid',
  },
);
export const updateDriverProfileSchema = z
  .object({
    vehicleName: safeText({ min: 1, max: 255, mode: 'title' }).optional(),
    vehiclePlate: vehiclePlateSchema.optional(),
  })
  .merge(updateBaseUserProfileSchema)
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .strict() satisfies ZodType<UpdateMyDriverDtoType>;
