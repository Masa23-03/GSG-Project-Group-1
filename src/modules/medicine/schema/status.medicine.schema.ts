import z from "zod"
import { DecimalLike } from "./decimal.medicine.schema"

export const ToggleActiveSchema = z.object({
    isActive: z.coerce.boolean(),
})

//* ADMIN approve/reject 
export const AdminReviewSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().trim().min(2).optional(),
    minPrice: DecimalLike.optional(),
    maxPrice: DecimalLike.optional(),
}).superRefine((data, ctx) => {
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
        }
    }
})
