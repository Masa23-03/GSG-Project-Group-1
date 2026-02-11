import z, { ZodType } from 'zod';
import { AvailabilityStatus } from '@prisma/client';
import { UpdateDriverAvailabilityDtoType } from '../dto/request.dto/availability.dto';

export const availabilitySchema = z
  .object({
    availabilityStatus: z.nativeEnum(AvailabilityStatus),
  })
  .strict() satisfies ZodType<UpdateDriverAvailabilityDtoType>;
