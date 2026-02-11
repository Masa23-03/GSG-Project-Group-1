import { Prisma } from '@prisma/client';

export type InventoryDetailsPayload = Prisma.InventoryItemGetPayload<{
  include: {
    medicine: true;
  };
}>;

export type InventoryListPayload = Prisma.InventoryItemGetPayload<{
  include: {
    medicine: {
      include: {
        category: true;
        medicineImages: { orderBy: { sortOrder: 'asc' }; take: 1 };
      };
    };
  };
}>;

export type InventoryAdminListPayload = Prisma.InventoryItemGetPayload<{
  include: {
    pharmacy: true;
    medicine: {
      include: {
        category: true;
        medicineImages: { orderBy: { sortOrder: 'asc' }; take: 1 };
      };
    };
  };
}>;
