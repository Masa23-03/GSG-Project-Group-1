import z, { ZodType } from 'zod';
import { CreateCityDtoType } from '../dto/create-city.dto';
import { Currency } from '@prisma/client';
import { UpdateCityDtoType } from '../dto/update-city.dto';
import { UpsertCityDeliveryFeeDtoType } from '../dto/CityDeliveryFeeDto';

export const createCitySchema = z
  .object({
    name: z.string().trim().min(2).max(255),
  })
  .strict() satisfies ZodType<CreateCityDtoType>;

export const updateCitySchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }) satisfies ZodType<UpdateCityDtoType>;
export const upsertCityDeliveryFeeSchema = z
  .object({
    standardFeeAmount: z.coerce.number().min(0),
    expressFeeAmount: z.coerce.number().min(0).nullable().optional(),
    currency: z.nativeEnum(Currency).optional(),
  })
  .strict() satisfies ZodType<UpsertCityDeliveryFeeDtoType>;
