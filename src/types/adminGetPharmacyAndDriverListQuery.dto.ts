import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from './pagination.query';
import { UserStatus, VerificationStatus } from '@prisma/client';
import { PaginationQueryType } from './unifiedType.types';

export class AdminBaseListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: VerificationStatus })
  status?: VerificationStatus;

  @ApiPropertyOptional({ enum: UserStatus })
  userStatus?: UserStatus;

  @ApiPropertyOptional({ type: 'string' })
  q?: string;
}

//ADMIN: Get drivers  query dto
export type AdminListQueryDto = AdminBaseListQueryDto;
