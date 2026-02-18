import { z, ZodType } from 'zod';
import { CreatePatientAddressDto } from '../dto/request/create-patient-address.dto';
import { UpdatePatientAddressDto } from '../dto/request/update-patient-address.dto';
import { safeText } from 'src/utils/zod.helper';
export const PatientAddressBaseSchema = z
  .object({
    cityId: z.number().int().positive(),
    addressLine1: safeText({ min: 1, max: 500, mode: 'address' }),
    isDefault: z.boolean().optional(),
    addressLine2: safeText({ min: 1, max: 500, mode: 'address' })
      .optional()
      .nullable(),
    label: safeText({ min: 1, max: 100, mode: 'title' }).optional().nullable(),
    region: safeText({ min: 1, max: 100, mode: 'title' }).optional().nullable(),
    area: safeText({ min: 1, max: 100, mode: 'title' }).optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
  })
  .strict();
export const CreatePatientAddressSchema = PatientAddressBaseSchema.refine(
  (d) =>
    (d.latitude == null && d.longitude == null) ||
    (d.latitude != null && d.longitude != null),
  {
    message: 'latitude and longitude must be provided together',
    path: ['latitude'],
  },
);

export const UpdatePatientAddressSchema = PatientAddressBaseSchema.omit({
  isDefault: true,
})
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
