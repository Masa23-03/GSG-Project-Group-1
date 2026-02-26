import { safeText, urlSchema } from 'src/utils/zod.helper';
import z from 'zod';

const uniqueUrls = (arr: string[]) => new Set(arr).size === arr.length;

export const createPrescriptionSchema = z
  .object({
    pharmacyId: z.number().int().min(1),
    fileUrls: z
      .array(urlSchema.transform((u) => u.trim()))
      .min(1)
      .max(5)
      .refine(uniqueUrls, { message: 'Duplicate file URLs are not allowed' }),
  })
  .strict();

export const reuploadPrescriptionSchema = z
  .object({
    fileUrls: z
      .array(urlSchema.transform((u) => u.trim()))
      .min(1)
      .max(5)
      .refine(uniqueUrls, { message: 'Duplicate file URLs are not allowed' }),
  })
  .strict();

export const requestNewPrescriptionSchema = z
  .object({
    reuploadReason: safeText({ min: 1, max: 500, mode: 'generic' }),
  })
  .strict();
