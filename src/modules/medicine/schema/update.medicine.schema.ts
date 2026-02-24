import { z } from 'zod';
import { DecimalLike, NonNegativeDecimalLike } from './decimal.medicine.schema';
import { MedicineImagesInputSchema } from './image.medicine.schema';
import {
  medicineNameSchema,
  medicineTextSchema,
  optionalNameSchema,
  priceSchema,
} from './medicine.schema.fields';

export const UpdateMedicineAdminSchema = z
  .object({
    categoryId: z.coerce.number().int().positive().optional(),
    genericName: medicineNameSchema.optional(),
    brandName: optionalNameSchema,
    manufacturer: optionalNameSchema,
    dosageForm: optionalNameSchema,
    strengthValue: NonNegativeDecimalLike.optional(),
    strengthUnit: optionalNameSchema,
    packSize: z.coerce.number().int().positive().optional(),
    packUnit: optionalNameSchema,
    requiresPrescription: z.coerce.boolean().optional(),
    activeIngredients: medicineTextSchema,
    dosageInstructions: medicineTextSchema,
    storageInstructions: medicineTextSchema,
    warnings: medicineTextSchema,
    description: medicineTextSchema,
    minPrice: priceSchema.optional(),
    maxPrice: priceSchema.optional(),
    images: MedicineImagesInputSchema,
  })
  .strict();

//* PHARMACY update its own request -PENDING-
export const UpdateMedicinePharmacyRequestSchema =
  UpdateMedicineAdminSchema.omit({
    minPrice: true,
    maxPrice: true,
  }).strict();
