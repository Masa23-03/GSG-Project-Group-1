import { z } from 'zod';
import { CreateInventoryItemDtoType } from '../dto/create-inventory.dto';

export const CreateInventoryItemSchema = z
  .object({
    medicineId: z.number().int().positive(),
    stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
    sellPrice: z.number().positive(),
    costPrice: z.number().nonnegative().nullable().optional(),
    minStock: z.number().int().nonnegative().default(0),
    batchNumber: z.string().trim().nullable().optional(),
    expiryDate: z.string().datetime().nullable().optional(),
    shelfLocation: z.string().trim().nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .strict() satisfies z.ZodType<CreateInventoryItemDtoType>;


