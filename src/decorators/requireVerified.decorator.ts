import { SetMetadata } from '@nestjs/common';

export const REQUIRE_VERIFIED_KEY = 'require_verified';
export type RequireVerifiedTarget = 'PHARMACY' | 'DRIVER';
export const RequireVerified = (target: RequireVerifiedTarget) =>
  SetMetadata(REQUIRE_VERIFIED_KEY, target);
