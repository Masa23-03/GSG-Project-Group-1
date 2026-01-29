import z, { ZodType } from 'zod';
import { urlSchema } from 'src/utils/zod.helper';
import {
  UpdateMyPatientDtoType,
  UpdateMyUserBaseDtoType,
} from '../dto/request.dto/profile.dto';
export const updateBaseUserProfileSchema = z
  .object({
    name: z.string().trim().min(1).nullable().optional(),
    phoneNumber: z.string().trim().min(1).nullable().optional(),
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
  .strict() satisfies ZodType<UpdateMyPatientDtoType>;
