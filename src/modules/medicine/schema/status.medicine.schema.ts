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
})
