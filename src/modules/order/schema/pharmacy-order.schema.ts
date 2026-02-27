import z, { ZodType } from 'zod';
import {
  PharmacyOrderFilter,
  PharmacyOrderQueryDtoType,
} from '../dto/request.dto/order.query.dto';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { SortOrder } from 'src/types/pagination.query';
import {
  PharmacyOrderDecision,
  PharmacyOrderDecisionDtoType,
  PharmacyProgressStatus,
  UpdatePharmacyOrderStatusDtoType,
} from '../dto/request.dto/update-order.dto';

export const pharmacyOrderQuerySchema = z
  .object({
    filter: z.nativeEnum(PharmacyOrderFilter).optional(),

    sortOrder: z.nativeEnum(SortOrder).optional(),

    q: z.string().trim().min(1).max(100).optional(),
  })
  .merge(PaginationQuerySchema)
  .strict() satisfies ZodType<PharmacyOrderQueryDtoType>;

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
  }) satisfies ZodType<PharmacyOrderDecisionDtoType>;

export const updatePharmacyOrderStatusSchema = z
  .object({
    status: z.nativeEnum(PharmacyProgressStatus),
  })
  .strict() satisfies ZodType<UpdatePharmacyOrderStatusDtoType>;
