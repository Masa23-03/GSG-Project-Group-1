import { z } from 'zod';
import { DecimalLike, NonNegativeDecimalLike } from './decimal.medicine.schema';
import { MedicineImagesInputSchema } from './image.medicine.schema';

export const UpdateMedicineAdminSchema = z
  .object({
    categoryId: z.coerce.number().int().positive().optional(),
    genericName: z.string().trim().min(2).optional(),
    brandName: z.string().trim().optional(),
    manufacturer: z.string().trim().optional(),
    dosageForm: z.string().trim().optional(),
    strengthValue: NonNegativeDecimalLike.optional(),
    strengthUnit: z.string().trim().optional(),
    packSize: z.coerce.number().int().positive().optional(),
    packUnit: z.string().trim().optional(),
    requiresPrescription: z.coerce.boolean().optional(),
    activeIngredients: z.string().trim().optional(),
    dosageInstructions: z.string().trim().optional(),
    storageInstructions: z.string().trim().optional(),
    warnings: z.string().trim().optional(),
    description: z.string().trim().min(2).optional(),
    minPrice: NonNegativeDecimalLike.optional(),
    maxPrice: NonNegativeDecimalLike.optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
    path: [],
  })
  .superRefine((d, ctx) => {
    if (
      d.minPrice !== undefined &&
      d.maxPrice !== undefined &&
      Number(d.minPrice) > Number(d.maxPrice)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minPrice must be <= maxPrice',
        path: ['minPrice'],
      });
    }
  });

//* PHARMACY update its own request -PENDING-
export const UpdateMedicinePharmacyRequestSchema = z
  .object({
    categoryId: z.coerce.number().int().positive().optional(),
    genericName: z.string().trim().min(2).optional(),
    brandName: z.string().trim().optional(),
    manufacturer: z.string().trim().optional(),
    dosageForm: z.string().trim().optional(),
    strengthValue: NonNegativeDecimalLike.optional(),
    strengthUnit: z.string().trim().optional(),
    packSize: z.coerce.number().int().positive().optional(),
    packUnit: z.string().trim().optional(),
    requiresPrescription: z.coerce.boolean().optional(),
    activeIngredients: z.string().trim().optional(),
    dosageInstructions: z.string().trim().optional(),
    storageInstructions: z.string().trim().optional(),
    warnings: z.string().trim().optional(),
    description: z.string().trim().min(2).optional(),
    images: MedicineImagesInputSchema,
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
    path: [],
  });
