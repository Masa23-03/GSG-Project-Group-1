import { SetMetadata } from '@nestjs/common';

export const ALLOW_ONBOARDING_KEY = 'allow_onboarding';

export const AllowOnboarding = () => SetMetadata(ALLOW_ONBOARDING_KEY, true);
