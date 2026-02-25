import { z } from 'zod';
import { CreateInventoryItemDtoType } from '../dto/request.dto/create-inventory.dto';
import { safeText } from 'src/utils/zod.helper';
import { priceSchema } from 'src/modules/medicine/schema/medicine.schema.fields';

const isoDateString = z
  .string()
  .trim()
  .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s), { message: 'Use YYYY-MM-DD' })
  .refine(
    (s) => {
      const d = new Date(`${s}T00:00:00.000Z`);
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
    },
    { message: 'Invalid date' },
  );

const sellPriceSchema = priceSchema.positive();
const costPriceSchema = priceSchema.nullable().optional();

export const CreateInventoryItemSchema = z
  .object({
    medicineId: z.coerce.number().int().positive(),
    stockQuantity: z.coerce.number().int().min(0).max(1_000_000),
    minStock: z.coerce
      .number()
      .int()
      .min(0)
      .max(1_000_000)
      .optional()
      .default(0),
    sellPrice: sellPriceSchema,
    costPrice: costPriceSchema,
    batchNumber: safeText({ min: 1, max: 255, mode: 'generic' })
      .nullable()
      .optional(),
    expiryDate: isoDateString.nullable().optional(),
    shelfLocation: safeText({ min: 1, max: 255, mode: 'generic' })
      .nullable()
      .optional(),
    notes: safeText({ min: 1, max: 2000, mode: 'generic' })
      .nullable()
      .optional(),
  })
  .strict() satisfies z.ZodType<CreateInventoryItemDtoType>;

export const UpdateInventoryItemSchema =
  CreateInventoryItemSchema.partial().omit({ medicineId: true });
