import { Prisma } from '@prisma/client';

export const medicineIncludeForDetails = {
  category: true,
  medicineImages: { orderBy: { sortOrder: Prisma.SortOrder.asc } },
} satisfies Prisma.MedicineInclude;

export const medicineIncludeForList = {
  category: true,
  medicineImages: { orderBy: { sortOrder: Prisma.SortOrder.asc }, take: 1 },
} satisfies Prisma.MedicineInclude;

export const inventoryIncludeDetails = {
  medicine: { include: medicineIncludeForDetails },
} satisfies Prisma.InventoryItemInclude;

export const inventoryIncludeList = {
  medicine: { include: medicineIncludeForList },
} satisfies Prisma.InventoryItemInclude;

export const inventoryIncludeAdminList = {
  pharmacy: true,
  medicine: { include: medicineIncludeForList },
} satisfies Prisma.InventoryItemInclude;

export type InventoryDetailsPayload = Prisma.InventoryItemGetPayload<{
  include: typeof inventoryIncludeDetails;
}>;

export type InventoryListPayload = Prisma.InventoryItemGetPayload<{
  include: typeof inventoryIncludeList;
}>;

export type InventoryAdminListPayload = Prisma.InventoryItemGetPayload<{
  include: typeof inventoryIncludeAdminList;
}>;
