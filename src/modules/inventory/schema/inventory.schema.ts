import { z } from 'zod';
import { CreateInventoryItemDtoType } from '../dto/request.dto/create-inventory.dto';
export const CreateInventoryItemSchema = z
  .object({
    medicineId: z.number().int().positive(),
    stockQuantity: z.number().int().min(0).max(1_000_000),
    minStock: z.number().int().min(0).max(1_000_000),
    sellPrice: z.number().positive().max(1_000_000),
    costPrice: z.number().nonnegative().max(1_000_000).nullable().optional(),
    batchNumber: z.string().trim().nullable().optional(),
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
      .nullable()
      .optional(),
    shelfLocation: z.string().trim().nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .strict() satisfies z.ZodType<CreateInventoryItemDtoType>;

export const UpdateInventoryItemSchema =
  CreateInventoryItemSchema.partial().omit({ medicineId: true });
