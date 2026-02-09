import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PharmacyLocationDto } from 'src/modules/pharmacy/dto/response.dto/admin-pharmacy.response.dto';
import { PaginationQueryDto } from 'src/types/pagination.query';

export class PatientMedicinePharmacyItemDto {
  @ApiProperty({ description: 'Pharmacy ID.', example: 12 })
  pharmacyId!: number;

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
      'Distance in KM from patient location. Computed from default patient address.',
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
  @ApiProperty({
    description: 'Selling price of the medicine in this pharmacy.',
    example: 12.5,
  })
  sellPrice!: number;

  @ApiProperty({
    description: 'Available stock quantity for this medicine in this pharmacy.',
    example: 24,
  })
  stockQuantity!: number;
}

export class PatientMedicinePharmaciesQueryDto extends PaginationQueryDto {}
export type PatientMedicinePharmaciesQueryDtoType = InstanceType<
  typeof PatientMedicinePharmaciesQueryDto
>;
