import { z } from 'zod';
import { NonNegativeDecimalLike } from './decimal.medicine.schema';
import { MedicineImagesInputSchema } from './image.medicine.schema';

//* ADMIN create
export const CreateMedicineAdminSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
    genericName: z.string().trim().min(2),
    brandName: z.string().trim().min(1).optional(),
    manufacturer: z.string().trim().min(1).optional(),
    dosageForm: z.string().trim().min(1).optional(),
    strengthValue: NonNegativeDecimalLike.optional(),
    strengthUnit: z.string().trim().min(1).optional(),
    packSize: z.coerce.number().int().positive().optional(),
    packUnit: z.string().trim().min(1).optional(),
    requiresPrescription: z.coerce.boolean().optional().default(false),
    activeIngredients: z.string().trim().optional(),
    dosageInstructions: z.string().trim().optional(),
    storageInstructions: z.string().trim().optional(),
    warnings: z.string().trim().optional(),
    description: z.string().trim().min(2),

    minPrice: NonNegativeDecimalLike,
    maxPrice: NonNegativeDecimalLike,

    images: MedicineImagesInputSchema,
  })
  .refine((b) => Number(b.minPrice) <= Number(b.maxPrice), {
    message: 'minPrice must be <= maxPrice',
    path: ['minPrice'],
  });

//* PHARMACY request
export const CreateMedicinePharmacyRequestSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  genericName: z.string().trim().min(2),
  brandName: z.string().trim().min(1).optional(),
  manufacturer: z.string().trim().min(1).optional(),
  dosageForm: z.string().trim().min(1).optional(),
  strengthValue: NonNegativeDecimalLike.optional(),
  strengthUnit: z.string().trim().min(1).optional(),
  packSize: z.coerce.number().int().positive().optional(),
  packUnit: z.string().trim().min(1).optional(),
  requiresPrescription: z.coerce.boolean().optional(),
  activeIngredients: z.string().trim().optional(),
  dosageInstructions: z.string().trim().optional(),
  storageInstructions: z.string().trim().optional(),
  warnings: z.string().trim().optional(),
  description: z.string().trim().min(2),
  images: MedicineImagesInputSchema,
});
