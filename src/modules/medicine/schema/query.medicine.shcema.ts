import { z, ZodType } from 'zod';
import { MedicineStatus } from '@prisma/client';
import { removeFields } from 'src/utils/object.util';
import { PaginationQueryType } from 'src/types/unifiedType.types';

// const MedicineStatusWithoutRejected = removeFields( MedicineStatus, ['REJECTED'])

export const IdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
})

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
}).strict() satisfies ZodType<PaginationQueryType>

const BooleanFromStringSchema = z.preprocess(
    (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    },
    z.boolean(),
);

export const SearchQuerySchema = PaginationQuerySchema.extend({
    q: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
}).strict();


//* Admin list query 
export const AdminListQuerySchema = SearchQuerySchema.extend({
    status: z.nativeEnum(MedicineStatus).optional(),
    isActive: BooleanFromStringSchema.optional(),
})

//* Pharmacy requests list query 
export const PharmacyRequestsListQuerySchema = PaginationQuerySchema.extend({
    status: z.nativeEnum(MedicineStatus).optional(), 

    //! REJECTED status >> pharmacy will be able to see it ? 
})
