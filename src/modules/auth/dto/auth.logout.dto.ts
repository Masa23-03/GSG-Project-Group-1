import { RefreshToken } from '@prisma/client';

export type LogoutDto = {
  refreshToken: string;
};
