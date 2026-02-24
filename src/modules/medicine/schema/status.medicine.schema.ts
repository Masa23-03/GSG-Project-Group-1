import z from 'zod';
import { DecimalLike, NonNegativeDecimalLike } from './decimal.medicine.schema';
import { safeText } from 'src/utils/zod.helper';

export const ToggleActiveSchema = z
  .object({
    isActive: z.coerce.boolean(),
  })
  .strict();

//* ADMIN approve/reject
export const AdminReviewSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: safeText({ min: 2, max: 500 }).optional().nullable(),
    minPrice: NonNegativeDecimalLike.optional(),
    maxPrice: NonNegativeDecimalLike.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.status === 'REJECTED') {
      if (!data.rejectionReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'rejectionReason is required when status is REJECTED',
          path: ['rejectionReason'],
        });
      }
    }
    if (data.status === 'APPROVED') {
      if (data.minPrice === undefined || data.maxPrice === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'minPrice and maxPrice are required when status is APPROVED',
          path: ['minPrice'],
        });
        return;
      }
    }

    if (Number(data.minPrice) > Number(data.maxPrice)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minPrice must be <= maxPrice',
        path: ['minPrice'],
      });
    }
  });
