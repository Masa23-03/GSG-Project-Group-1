import { Prisma } from '@prisma/client';

export function toMeta(page: number, limit: number, total: number) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { page, limit, total, totalPages };
}

export const medicineInclude: Prisma.MedicineInclude = {
    medicineImages: {
        orderBy: { sortOrder: 'asc' },
    },
};

export type MedicineWithImages = Prisma.MedicineGetPayload<{
    include: typeof medicineInclude;
}>;
