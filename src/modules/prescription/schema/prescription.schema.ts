import z from 'zod';

export const createPrescriptionFileSchema = z
  .object({
    url: z.string().trim().min(5),
    sortOrder: z.number().int().min(1).optional(),
  })
  .strict();
export const createPrescriptionSchema = z
  .object({
    pharmacyId: z.number().int().min(1),
    files: z.array(createPrescriptionFileSchema).min(1),
  })
  .strict();

export const reuploadPrescriptionSchema = z
  .object({
    files: z.array(createPrescriptionFileSchema).min(1),
  })
  .strict();

export const requestNewPrescriptionSchema = z.object({
  reuploadReason: z.string().trim().min(1),
});
