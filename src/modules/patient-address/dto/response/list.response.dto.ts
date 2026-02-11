import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientAddressListItemResponseDto {
  @ApiProperty({
    example: 12,
    description: 'Unique identifier of the patient address',
  })
  id!: number;

  @ApiPropertyOptional({
    example: 'Home',
    description: 'Optional label for the address',
    nullable: true,
  })
  label?: string | null;

  @ApiProperty({
    example: 3,
    description: 'City identifier',
  })
  cityId!: number;

  @ApiProperty({
    example: 'Gaza',
    description: 'City name',
  })
  cityName!: string;

  @ApiProperty({
    example: 'Al Remal Street, Building 5',
    description: 'Primary address line',
  })
  addressLine1!: string;

  @ApiPropertyOptional({
    example: 31.5017,
    description: 'Latitude coordinate (if provided)',
    nullable: true,
  })
  latitude?: number | null;

  @ApiPropertyOptional({
    example: 34.4668,
    description: 'Longitude coordinate (if provided)',
    nullable: true,
  })
  longitude?: number | null;

  @ApiProperty({
    example: false,
    description: 'Indicates whether this is the default address',
  })
  isDefault!: boolean;
}
