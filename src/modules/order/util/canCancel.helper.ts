import { PharmacyOrderStatus } from '@prisma/client';

export const CANCELLABLE = [
  PharmacyOrderStatus.ACCEPTED,
  PharmacyOrderStatus.PENDING,
  PharmacyOrderStatus.REJECTED,
  PharmacyOrderStatus.PREPARING,
] as const;

const CANCELLABLE_SET = new Set<PharmacyOrderStatus>(CANCELLABLE);
export function canCancel(pharmacyOrders: PharmacyOrderStatus[]): boolean {
  if (!pharmacyOrders.length) return false;
  return pharmacyOrders.every((s) => CANCELLABLE_SET.has(s));
}
