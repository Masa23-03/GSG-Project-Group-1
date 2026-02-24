import { z } from 'zod';

//* Images input
export const MedicineImagesInputSchema = z
  .array(
    z.object({
      url: z.string().trim().url(),
      sortOrder: z.coerce.number().int().min(0).max(127),
    }),
  )

  .max(20)
  .optional()
  .refine(
    (arr) => !arr || new Set(arr.map((x) => x.sortOrder)).size === arr.length,
    { message: 'Duplicate sortOrder values are not allowed' },
  );
