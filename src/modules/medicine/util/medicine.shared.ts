import { Prisma } from '@prisma/client';

export const medicineInclude: Prisma.MedicineInclude = {
  medicineImages: {
    orderBy: { sortOrder: 'asc' },
  },
};

export type MedicineWithImages = Prisma.MedicineGetPayload<{
  include: typeof medicineInclude;
}>;
