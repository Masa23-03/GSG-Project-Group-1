import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { PaginationQueryDto } from 'src/types/pagination.query';

export class AdminUserListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Free-text search across: id (exact if numeric), name, email, phoneNumber.',
    example: 'shahd',
  })
  q?: string;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Filter users by account status.',
  })
  status?: UserStatus;
}

export type AdminUserListQueryDtoT = InstanceType<typeof AdminUserListQueryDto>;
