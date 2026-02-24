import { z } from 'zod';
import { NonNegativeDecimalLike } from './decimal.medicine.schema';
import { MedicineImagesInputSchema } from './image.medicine.schema';
import {
  imagesSchema,
  medicineNameSchema,
  medicineTextSchema,
  optionalNameSchema,
  priceSchema,
} from './medicine.schema.fields';
import { safeText } from 'src/utils/zod.helper';

//* ADMIN create
export const CreateMedicineAdminSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
    genericName: medicineNameSchema,
    brandName: optionalNameSchema,
    manufacturer: optionalNameSchema,
    dosageForm: optionalNameSchema,
    strengthValue: NonNegativeDecimalLike.optional(),
    strengthUnit: optionalNameSchema,
    packSize: z.coerce.number().int().positive().optional(),
    packUnit: optionalNameSchema,
    requiresPrescription: z.coerce.boolean().optional().default(false),
    activeIngredients: medicineTextSchema,
    dosageInstructions: medicineTextSchema,
    storageInstructions: medicineTextSchema,
    warnings: medicineTextSchema,
    description: safeText({ min: 1, max: 2000 }),

    minPrice: priceSchema,
    maxPrice: priceSchema,

    images: imagesSchema,
  })
  .strict()
  .refine((b) => Number(b.minPrice) <= Number(b.maxPrice), {
    message: 'minPrice must be <= maxPrice',
    path: ['minPrice'],
  });

//* PHARMACY request
export const CreateMedicinePharmacyRequestSchema =
  CreateMedicineAdminSchema.omit({
    minPrice: true,
    maxPrice: true,
  }).strict();
