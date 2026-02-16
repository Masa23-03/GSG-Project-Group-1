import z, { ZodType } from 'zod';
import { nameSchema, phoneSchema, urlSchema } from 'src/utils/zod.helper';
import {
  UpdateMyPatientDtoType,
  UpdateMyUserBaseDtoType,
} from '../dto/request.dto/profile.dto';
export const updateBaseUserProfileSchema = z
  .object({
    name: nameSchema.optional(),
    phoneNumber: phoneSchema.optional(),
    profileImageUrl: urlSchema.nullable().optional(),
  })
  .strict() satisfies ZodType<UpdateMyUserBaseDtoType>;

export const updatePatientProfileSchema = z
  .object({
    //YYYY-MM-DD
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'dateOfBirth must be YYYY-MM-DD',
      })
      .nullable()
      .optional(),
  })
  .merge(updateBaseUserProfileSchema)
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .strict() satisfies ZodType<UpdateMyPatientDtoType>;
