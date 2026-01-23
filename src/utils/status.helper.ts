import { BadRequestException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';

const AllowedInto: Record<VerificationStatus, VerificationStatus[]> = {
  UNDER_REVIEW: [VerificationStatus.VERIFIED, VerificationStatus.REJECTED],
  VERIFIED: [],
  REJECTED: [VerificationStatus.VERIFIED],
};
export function assertVerificationStatusTransition(
  from: VerificationStatus,
  to: VerificationStatus,
) {
  const isOk = AllowedInto[from]?.includes(to);
  if (!isOk)
    throw new BadRequestException(
      `Invalid status transition: ${from} -> ${to}`,
    );
}
