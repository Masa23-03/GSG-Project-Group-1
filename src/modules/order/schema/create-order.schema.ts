import z, { ZodType } from 'zod';
import { CreatePharmacyOrderItemDtoType } from '../dto/request.dto/create-order.dto';
import { Currency } from '@prisma/client';

export const createPharmacyOrderItemSchema = z
  .object({
    inventoryId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
  })
  .strict() satisfies ZodType<CreatePharmacyOrderItemDtoType>;

export const createPharmacyOrderSchema = z
  .object({
    pharmacyId: z.coerce.number().int().positive(),
    items: z.array(createPharmacyOrderItemSchema).min(1),

    prescriptionId: z.coerce.number().int().positive().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    const itemsIds = val.items.map((i) => i.inventoryId);
    const duplicate = itemsIds.find((id, i) => itemsIds.indexOf(id) !== i);
    if (duplicate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items'],
        message: 'Duplicate inventoryId in the same pharmacy is not allowed',
      });
    }
  });
export const createOrderSchema = z
  .object({
    deliveryAddressId: z.coerce.number().int().positive(),
    notes: z
      .string()
      .trim()
      .transform((v) => (v.length ? v : null))
      .nullable()
      .optional(),
    currency: z.nativeEnum(Currency).optional(),
    pharmacies: z.array(createPharmacyOrderSchema).min(1),
  })
  .superRefine((val, ctx) => {
    const pharmacyIds = val.pharmacies.map((i) => i.pharmacyId);
    const duplicate = pharmacyIds.find(
      (id, i) => pharmacyIds.indexOf(id) !== i,
    );
    if (duplicate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pharmacies'],
        message: 'Duplicate pharmacyId is not allowe',
      });
    }
  });
