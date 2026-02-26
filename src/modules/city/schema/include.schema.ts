import z from 'zod';

export const includeSchema = z.object({
  include: z.enum(['deliveryFee']).optional(),
});
