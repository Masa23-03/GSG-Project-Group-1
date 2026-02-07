import { BadRequestException } from '@nestjs/common';
import { PharmacyOrderStatus } from '@prisma/client';

const AllowedInto: Record<PharmacyOrderStatus, PharmacyOrderStatus[]> = {
  PENDING: [
    PharmacyOrderStatus.ACCEPTED,
    PharmacyOrderStatus.REJECTED,
    PharmacyOrderStatus.CANCELLED,
  ],
  ACCEPTED: [PharmacyOrderStatus.PREPARING, PharmacyOrderStatus.CANCELLED],
  REJECTED: [],
  PREPARING: [
    PharmacyOrderStatus.READY_FOR_PICKUP,
    PharmacyOrderStatus.CANCELLED,
  ],
  READY_FOR_PICKUP: [PharmacyOrderStatus.PICKED_UP],
  PICKED_UP: [PharmacyOrderStatus.COMPLETED],
  CANCELLED: [],
  COMPLETED: [],
};

export function assertPharmacyOrderTransition(
  from: PharmacyOrderStatus,
  to: PharmacyOrderStatus,
) {
  const allowed = AllowedInto[from].includes(to);
  if (!allowed)
    throw new BadRequestException(
      `Invalid status transition: ${from} -> ${to}`,
    );
}
