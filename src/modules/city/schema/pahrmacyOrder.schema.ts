import {
  PharmacyOrderDecision,
  PharmacyOrderDecisionDto,
} from 'src/modules/order/dto/request.dto/update-order.dto';
import z, { ZodType } from 'zod';

export const pharmacyOrderDecisionSchema = z
  .object({
    decision: z.nativeEnum(PharmacyOrderDecision),
    rejectionReason: z.string().trim().min(3).nullable().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.decision === PharmacyOrderDecision.REJECT) {
      if (!val.rejectionReason || val.rejectionReason.trim().length < 3)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rejectionReason'],
          message: 'rejectionReason is required when decision is REJECT',
        });
    }
  }) satisfies ZodType<PharmacyOrderDecisionDto>;
