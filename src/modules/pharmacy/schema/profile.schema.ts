import { z, type ZodType } from 'zod';
import { safeText, timeHHmm } from 'src/utils/zod.helper';
import { updateBaseUserProfileSchema } from 'src/modules/user/schema/profile.schema';
import { UpdateMyPharmacyProfileDtoType } from '../dto/request.dto/profile.dto';

export const workingHoursSchema = z
  .object({
    openTime: timeHHmm,
    closeTime: timeHHmm,
  })
  .refine(
    (v) => {
      const openProvided = v.openTime != null;
      const closeProvided = v.closeTime != null;

      if (!openProvided && !closeProvided) return true;
      if (openProvided !== closeProvided) return false;
      const [openH, openM] = (v.openTime as string).split(':').map(Number);
      const [closeH, closeM] = (v.closeTime as string).split(':').map(Number);

      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      return closeMinutes > openMinutes;
    },
    {
      message: 'closeTime must be after openTime',
      path: ['closeTime'],
    },
  )
  .strict();

export const updatePharmacyProfileSchema = z
  .object({
    pharmacyName: safeText({ min: 2, max: 255, mode: 'title' }),
    workingHours: workingHoursSchema.nullable().optional(),
    address: safeText({ min: 2, max: 255, mode: 'address' }),
    latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  })
  .merge(updateBaseUserProfileSchema)
  .strict() satisfies ZodType<UpdateMyPharmacyProfileDtoType>;
