import { Prisma } from '@prisma/client';

export const medicineInclude = {
  medicineImages: {
    orderBy: { sortOrder: 'asc' },
  },
  category: { select: { id: true, name: true } },
} satisfies Prisma.MedicineInclude;

export type MedicineWithImages = Prisma.MedicineGetPayload<{
  include: typeof medicineInclude;
}>;
