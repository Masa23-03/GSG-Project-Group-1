import { ApiProperty } from '@nestjs/swagger';
import {
  AvailabilityStatus,
  UserRole,
  VerificationStatus,
} from '@prisma/client';

export class DriverMeResponseDto {
  @ApiProperty({
    description: 'Driver ID.',
    example: 15,
  })
  driverId!: number;

  @ApiProperty({
    description: 'Associated user ID.',
    example: 200,
  })
  userId!: number;

  @ApiProperty({
    enum: UserRole,
    description: 'User role.',
    example: UserRole.DRIVER,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'User email address.',
    example: 'driver@test.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User phone number.',
    example: '+970599000011',
  })
  phoneNumber!: string;

  @ApiProperty({
    description: 'User name.',
    example: 'Shahd',
  })
  name!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Profile image URL.',
    example: 'https://example.com/profile.jpg',
  })
  profileImageUrl?: string | null;

  @ApiProperty({
    enum: AvailabilityStatus,
    description: 'Driver availability status.',
    example: AvailabilityStatus.OFFLINE,
  })
  availabilityStatus!: AvailabilityStatus;

  @ApiProperty({
    description: 'Vehicle name.',
    example: 'Toyota Corolla',
  })
  vehicleName!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Vehicle plate number.',
    example: 'ABC-1234',
  })
  vehiclePlate?: string | null;

  @ApiProperty({
    enum: VerificationStatus,
    description: 'Driver verification status.',
    example: VerificationStatus.UNDER_REVIEW,
  })
  verificationStatus!: VerificationStatus;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Account creation timestamp.',
    example: '2026-02-10T09:12:33.123Z',
  })
  createdAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Last profile update timestamp.',
    example: '2026-02-22T18:40:10.000Z',
  })
  updatedAt!: string;
}
