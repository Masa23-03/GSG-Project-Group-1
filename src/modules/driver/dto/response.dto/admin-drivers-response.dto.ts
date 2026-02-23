import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus, VerificationStatus } from '@prisma/client';

export enum BusyStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
}
//Admin: get drivers response
export class AdminDriverListItemDto {
  @ApiProperty({
    description: 'Driver ID.',
    example: 15,
  })
  id!: number;

  @ApiProperty({
    description: 'Driver name.',
    example: 'Shahd',
  })
  name!: string;

  @ApiProperty({
    description: 'Driver phone number.',
    example: '+970599000011',
  })
  phoneNumber!: string;

  @ApiProperty({
    description: 'Vehicle name or model.',
    example: 'Toyota Prius',
  })
  vehicleName!: string;

  @ApiProperty({
    description: 'Vehicle plate number.',
    example: 'ABC-1234',
  })
  vehiclePlate!: string;

  @ApiProperty({
    enum: AvailabilityStatus,
    description: 'Driver availability status.',
    example: AvailabilityStatus.OFFLINE,
  })
  availabilityStatus!: AvailabilityStatus;

  @ApiProperty({
    enum: VerificationStatus,
    description: 'Driver verification status.',
    example: VerificationStatus.UNDER_REVIEW,
  })
  verificationStatus!: VerificationStatus;

  @ApiProperty({
    enum: BusyStatus,
    description: 'Computed field. BUSY if driver has active deliveries.',
    example: BusyStatus.AVAILABLE,
  })
  busyStatus!: BusyStatus;
}
export class AdminDriverDetailsDto extends AdminDriverListItemDto {
  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Driver license number.',
    example: 'LIC-998877',
  })
  licenseNumber?: string | null;

  @ApiProperty({
    description: 'URL of the uploaded driver license document.',
    example: 'https://example.com/license.png',
  })
  licenseDocumentUrl!: string;
}

//Admin update driver status response
export class AdminDriverVerificationUpdateResponseDto extends AdminDriverListItemDto {
  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
    description: 'Timestamp when the driver was reviewed.',
    example: '2026-02-22T18:40:10.000Z',
  })
  reviewedAt?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Admin user ID who reviewed the driver.',
    example: 1,
  })
  reviewedBy?: number | null;
}
