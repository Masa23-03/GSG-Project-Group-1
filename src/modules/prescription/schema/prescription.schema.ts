import z from 'zod';

export const createPrescriptionSchema = z
  .object({
    pharmacyId: z.number().int().min(1),
    fileUrls: z.array(z.string().trim().min(5)).min(1),
  })
  .strict();

export const reuploadPrescriptionSchema = z
  .object({
    fileUrls: z.array(z.string().trim().min(5)).min(1),
  })
  .strict();

export const requestNewPrescriptionSchema = z.object({
  reuploadReason: z.string().trim().min(1),
});
