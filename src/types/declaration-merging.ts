import { UserRole } from '@prisma/client';

declare global {
  interface Request {
    user?: { id: string; role: UserRole };
  }

  interface BigInt {
    toJSON(): string;
  }
}
