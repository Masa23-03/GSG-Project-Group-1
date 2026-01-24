import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '@prisma/client';
export class LocationDto {
  @ApiProperty({ required: false })
  address?: string;
  @ApiProperty({ required: false })
  latitude?: number;
  @ApiProperty({ required: false })
  longitude?: number;
}

//Admin: get pharmacies response
export class AdminPharmacyListItemDto extends LocationDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  pharmacyName!: string;
  @ApiProperty()
  phoneNumber!: string;
  @ApiProperty()
  cityName!: string;
  @ApiProperty()
  verificationStatus!: VerificationStatus;
}

//Admin get pharmacy details
export class AdminPharmacyDetailsDto extends AdminPharmacyListItemDto {
  @ApiProperty()
  licenseNumber!: string;
  @ApiProperty({ required: false })
  licenseDocumentUrl?: string;
}

//Admin update pharmacy status response
export class AdminPharmacyStatusUpdateResponseDto extends AdminPharmacyListItemDto {
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  verifiedAt?: string;
  @ApiProperty({ required: false })
  verifiedBy?: number;
}
