import { z } from 'zod';
import { MedicineStatus } from '@prisma/client';
import { removeFields } from 'src/utils/object.util';

// const MedicineStatusWithoutRejected = removeFields( MedicineStatus, ['REJECTED'])

export const IdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
})

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
})

export const SearchQuerySchema = z.object({
    q: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
}).strict();


//* Admin list query 
export const AdminListQuerySchema = SearchQuerySchema.extend({
    status: z.enum(MedicineStatus).optional(),
    isActive: z
        .union([z.coerce.boolean(), z.enum(['true', 'false'])])
        .optional()
        .transform((v) => (typeof v === 'string' ? v === 'true' : v)),
})

//* Pharmacy requests list query 
export const PharmacyRequestsListQuerySchema = PaginationQuerySchema.extend({
    status: z.nativeEnum(MedicineStatus).optional(), 

    //! REJECTED status >> pharmacy will be able to see it ? 
})
