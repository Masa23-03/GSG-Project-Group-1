import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus, VerificationStatus } from '@prisma/client';

export enum BusyStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
}
//Admin: get drivers response
export class AdminDriverListItemDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  phoneNumber!: string;
  @ApiProperty()
  vehicleName!: string;
  @ApiProperty()
  vehiclePlate!: string;
  @ApiProperty()
  availabilityStatus!: AvailabilityStatus;
  @ApiProperty()
  verificationStatus!: VerificationStatus;
  @ApiProperty({ enum: BusyStatus })
  busyStatus!: BusyStatus;
}
export class AdminDriverDetailsDto extends AdminDriverListItemDto {
  @ApiProperty({ required: false })
  licenseNumber?: string;
  @ApiProperty()
  licenseDocumentUrl!: string;
}

//Admin update driver status response
export class AdminDriverVerificationUpdateResponseDto extends AdminDriverListItemDto {
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  verifiedAt?: string;
  @ApiProperty({ required: false })
  verifiedBy?: number;
}
