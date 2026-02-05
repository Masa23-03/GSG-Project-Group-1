import { UserRole } from '@prisma/client';
import { AuthStage } from 'src/decorators/stage.decorator';

export interface JWT_Payload_STAGE {
    sub: string;
    role: UserRole;
    stage: AuthStage;
}
