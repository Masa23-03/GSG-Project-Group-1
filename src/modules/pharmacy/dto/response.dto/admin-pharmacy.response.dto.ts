import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '@prisma/client';
export class PharmacyLocationDto {
  @ApiProperty({ required: false })
  address?: string | null;

  @ApiProperty({ required: false })
  latitude?: number | null;
  @ApiProperty({ required: false })
  longitude?: number | null;
}
//Admin: get pharmacies response
export class AdminPharmacyListItemDto extends PharmacyLocationDto {
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
  licenseDocumentUrl?: string | null;
}

//Admin update pharmacy status response
export class AdminPharmacyStatusUpdateResponseDto extends AdminPharmacyListItemDto {
  @ApiProperty({ type: String, format: 'date-time' })
  reviewedAt!: string;
  @ApiProperty({ nullable: true })
  reviewedBy!: number | null;
}
