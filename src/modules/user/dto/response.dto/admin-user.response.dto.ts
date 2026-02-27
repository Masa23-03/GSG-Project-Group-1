import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class AdminUserListItemDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty() phoneNumber!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class AdminUserDetailsDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty() phoneNumber!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiPropertyOptional({ nullable: true, format: 'date' })
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ nullable: true })
  profileImageUrl?: string | null;

  @ApiProperty()
  isEmailVerified!: boolean;

  @ApiProperty()
  isPhoneVerified!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}
