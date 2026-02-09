import { z } from 'zod';
import { CreateCategoryDto } from '../dto/request.dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/request.dto/update-category.dto';
import { urlSchema } from 'src/utils/zod.helper';
export const createCategorySchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
    description: z.string().nullable().optional(),
    categoryImageUrl: urlSchema.nullable().optional(),
  })
  .strict() satisfies z.ZodType<CreateCategoryDto>;

export const updateCategorySchema = createCategorySchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }) satisfies z.ZodType<UpdateCategoryDto>;
