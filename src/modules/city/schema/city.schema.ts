import z, { ZodType } from 'zod';
import { CreateCityDtoType } from '../dto/create-city.dto';
import { Currency } from '@prisma/client';
import { UpdateCityDtoType } from '../dto/update-city.dto';
import { UpsertCityDeliveryFeeDtoType } from '../dto/CityDeliveryFeeDto';
import { englishNameSchema } from 'src/modules/category/schema/category.schema';
import { MoneyDecimalLike } from 'src/modules/medicine/schema/decimal.medicine.schema';

export const createCitySchema = z
  .object({
    name: englishNameSchema,
  })
  .strict() satisfies ZodType<CreateCityDtoType>;

export const updateCitySchema = z
  .object({
    name: englishNameSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }) satisfies ZodType<UpdateCityDtoType>;
export const upsertCityDeliveryFeeSchema = z
  .object({
    standardFeeAmount: MoneyDecimalLike,
    expressFeeAmount: MoneyDecimalLike.nullable().optional(),
    currency: z.nativeEnum(Currency).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.expressFeeAmount == null) return true;
      return Number(data.expressFeeAmount) >= Number(data.standardFeeAmount);
    },
    {
      message: 'Express fee must be >= standard fee',
      path: ['expressFeeAmount'],
    },
  ) satisfies ZodType<UpsertCityDeliveryFeeDtoType>;
