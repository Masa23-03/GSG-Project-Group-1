import { PharmacyOrderStatus } from '@prisma/client';

const CANCELLABLE_STATUSES = new Set<PharmacyOrderStatus>([
  PharmacyOrderStatus.ACCEPTED,
  PharmacyOrderStatus.PENDING,
  PharmacyOrderStatus.REJECTED,
  PharmacyOrderStatus.PREPARING,
]);
export function canCancel(pharmacyOrders: PharmacyOrderStatus[]): boolean {
  if (!pharmacyOrders.length) return false;
  return pharmacyOrders.every((s) => CANCELLABLE_STATUSES.has(s));
}
