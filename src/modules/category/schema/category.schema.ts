import { z } from 'zod';
import { CreateCategoryDto } from '../dto/request.dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/request.dto/update-category.dto';
import { safeText, urlSchema } from 'src/utils/zod.helper';
export const englishOnly = /^[A-Za-z0-9 .,'’"()\-\/&]+$/;

export const englishNameSchema = safeText({
  min: 2,
  max: 255,
  mode: 'title',
}).refine((v) => englishOnly.test(v), {
  message: 'Name must be English characters only',
});
const categoryDescriptionSchema = safeText({
  min: 1,
  max: 2000,
  mode: 'generic',
}).refine((v) => v.length > 0, { message: 'Description cannot be empty' });

const categoryImageUrlSchema = urlSchema.max(255, 'Image URL is too long');

export const createCategorySchema = z
  .object({
    name: englishNameSchema,
    description: categoryDescriptionSchema.nullable().optional(),
    categoryImageUrl: categoryImageUrlSchema.nullable().optional(),
  })
  .strict() satisfies z.ZodType<CreateCategoryDto>;

export const updateCategorySchema = createCategorySchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }) satisfies z.ZodType<UpdateCategoryDto>;
