import { ApiProperty } from '@nestjs/swagger';
import { RefreshToken } from '@prisma/client';

export type LogoutDto = Pick<RefreshToken, 'token'>;
