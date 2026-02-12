import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PharmacyLocationDto } from './admin-pharmacy.response.dto';

export class PatientPharmacyListResponseDto {
  @ApiProperty({ description: 'Pharmacy ID.', example: 12 })
  id!: number;

  @ApiProperty({
    description: 'Pharmacy display name.',
    example: 'Al-Shifa Pharmacy',
  })
  pharmacyName!: string;

  @ApiProperty({
    description: 'City ID where the pharmacy is located.',
    example: 2,
  })
  cityId!: number;

  @ApiProperty({
    description: 'City name where the pharmacy is located.',
    example: 'Deir al-Balah',
  })
  cityName!: string;

  @ApiProperty({
    description: 'Address + coordinates.',
    type: PharmacyLocationDto,
  })
  address!: PharmacyLocationDto;

  @ApiPropertyOptional({
    description:
      'Distance in KM from patient location. Computed only when request includes lat/lng and pharmacy has coordinates. Otherwise null.',
    example: 1.8,
    nullable: true,
  })
  distanceKm!: number | null;

  @ApiProperty({
    description: 'ETA placeholder.',
    example: null,
    nullable: true,
    type: 'null',
  })
  eta!: null;

  @ApiPropertyOptional({
    description: 'Standard delivery fee for the pharmacy city.',
    example: 10,
    nullable: true,
  })
  deliveryFee?: number | null;

  @ApiPropertyOptional({
    description: 'Pharmacy cover image URL (if exist).',
    example: 'https://cdn.example.com/pharmacies/12/cover.jpg',
    nullable: true,
  })
  coverImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Pharmacy profile image URL (if exist).',
    example: 'https://cdn.example.com/users/88/profile.jpg',
    nullable: true,
  })
  profileImageUrl?: string | null;

  @ApiProperty({
    description:
      'True only when workOpenTime/workCloseTime exist and current time is within working hours.',
    example: true,
  })
  isOpenNow!: boolean;
}

export class PatientPharmacyDetailsDto extends PatientPharmacyListResponseDto {
  @ApiPropertyOptional({
    description: 'Work open time (HH:mm). Null if not set.',
    example: '08:00',
    nullable: true,
  })
  workOpenTime!: string | null;

  @ApiPropertyOptional({
    description: 'Work close time (HH:mm). Null if not set.',
    example: '23:00',
    nullable: true,
  })
  workCloseTime!: string | null;

  @ApiProperty({
    description: 'Pharmacy owner phone number.',
    example: '+970599000000',
  })
  phoneNumber!: string;
}
