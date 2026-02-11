import { z, ZodType } from 'zod';
import { CreatePatientAddressDto } from '../dto/request/create-patient-address.dto';
import { UpdatePatientAddressDto } from '../dto/request/update-patient-address.dto';

export const CreatePatientAddressSchema = z
  .object({
    cityId: z.number().int().positive(),
    addressLine1: z.string().min(1).max(255),
    isDefault: z.boolean().optional(),
    addressLine2: z.string().max(255).optional().nullable(),
    label: z.string().max(100).optional().nullable(),
    region: z.string().max(100).optional().nullable(),
    area: z.string().max(100).optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
  })
  .strict() satisfies ZodType<CreatePatientAddressDto>;

export const UpdatePatientAddressSchema = CreatePatientAddressSchema.partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .refine(
    (data) => {
      if (data.isDefault === false) return false;
      return true;
    },
    {
      message:
        "You cannot unset a default address. Set another address to 'true' instead.",
      path: ['isDefault'],
    },
  ).strict() satisfies ZodType<UpdatePatientAddressDto>;
