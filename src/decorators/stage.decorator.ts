import { SetMetadata } from '@nestjs/common';

export const REQUIRE_STAGE_KEY = 'stage';
export enum AuthStage {
    LIMITED = 'LIMITED',
    FULL = 'FULL',
}

export const RequireStage = (stage: AuthStage) =>
    SetMetadata(REQUIRE_STAGE_KEY, stage);