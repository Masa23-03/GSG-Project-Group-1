import { UserRole } from '@prisma/client';
import { AuthStage } from 'src/decorators/stage.decorator';

declare global {
  namespace Express {
    interface Request {
      user?: { 
        id: number; 
        role: UserRole; 
        stage?: AuthStage 
      };
    }
  }

  interface BigInt {
    toJSON(): string;
  }
}
