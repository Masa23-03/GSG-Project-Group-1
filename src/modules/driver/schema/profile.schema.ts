import z, { ZodType } from 'zod';
import { UpdateMyDriverDtoType } from '../dto/request.dto/profile.dto';
import { updateBaseUserProfileSchema } from 'src/modules/user/schema/profile.schema';

export const updateDriverProfileSchema = z
  .object({
    vehicleName: z.string().trim().min(1).nullable().optional(),
    vehiclePlate: z.string().trim().min(1).nullable().optional(),
  })
  .merge(updateBaseUserProfileSchema)
  .strict() satisfies ZodType<UpdateMyDriverDtoType>;
