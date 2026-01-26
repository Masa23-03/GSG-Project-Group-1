import { ApiProperty } from '@nestjs/swagger';
import {
  AvailabilityStatus,
  UserRole,
  VerificationStatus,
} from '@prisma/client';

//driver profile
export class DriverMeResponseDto {
  @ApiProperty()
  driverId!: number;
  @ApiProperty()
  userId!: number;
  @ApiProperty({ enum: UserRole })
  role!: UserRole;
  @ApiProperty()
  email!: string;
  @ApiProperty()
  phoneNumber!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ required: false, nullable: true })
  profileImageUrl?: string | null;
  @ApiProperty({ enum: AvailabilityStatus })
  availabilityStatus!: AvailabilityStatus;
  @ApiProperty()
  vehicleName!: string;

  @ApiProperty({ required: false, nullable: true })
  vehiclePlate?: string | null;
  @ApiProperty({ enum: VerificationStatus })
  verificationStatus!: VerificationStatus;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
