import { UserRole } from '@prisma/client';

//define jwt payload
export type JWT_Payload = {
  sub: string;
  role: UserRole;
};
