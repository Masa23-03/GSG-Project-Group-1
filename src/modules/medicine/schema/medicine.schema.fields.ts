import { z } from 'zod';
import { safeText, urlSchema } from 'src/utils/zod.helper';

export const medicineNameSchema = safeText({
  min: 2,
  max: 100,
  mode: 'title',
});

export const optionalNameSchema = medicineNameSchema.optional().nullable();

export const medicineTextSchema = safeText({
  min: 0,
  max: 2000,
  mode: 'generic',
})
  .optional()
  .nullable();

export const priceSchema = z.coerce.number().nonnegative();

export const optionalPriceSchema = z.coerce.number().nonnegative().optional();

export const imagesSchema = z
  .array(
    z.object({
      url: urlSchema,
      sortOrder: z.coerce.number().int().min(0).max(127),
    }),
  )
  .refine((arr) => new Set(arr.map((i) => i.sortOrder)).size === arr.length, {
    message: 'images.sortOrder must be unique',
  })
  .optional()
  .default([]);
