import z, { ZodType } from 'zod';
import { UpdateMyUserDtoType } from '../dto/request.dto/profile.dto';
import { urlSchema } from 'src/utils/zod.helper';

export const updateUserProfileSchema = z
  .object({
    name: z.string().trim().min(1).nullable().optional(),
    phoneNumber: z.string().trim().min(1).nullable().optional(),
    //YYYY-MM-DD
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'dateOfBirth must be YYYY-MM-DD',
      })
      .nullable()
      .optional(),
    profileImageUrl: urlSchema.nullable().optional(),
  })
  .strict() satisfies ZodType<UpdateMyUserDtoType>;
