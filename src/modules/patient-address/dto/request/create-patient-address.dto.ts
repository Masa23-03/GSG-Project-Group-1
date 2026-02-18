import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientAddressDto {
  @ApiProperty({
    description: "City ID of the patient's address",
    example: 3,
    minimum: 1,
  })
  cityId!: number;
  @ApiProperty({
    example: 'Al Remal Street, Building 5',
    description: 'Primary address line',
    minLength: 1,
    maxLength: 500,
  })
  addressLine1!: string;
  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is the default address for the patient',
  })
  isDefault?: boolean;
  @ApiPropertyOptional({
    example: 'Apartment 3B',
    description: 'Secondary address line',
    nullable: true,
    maxLength: 500,
  })
  addressLine2?: string | null;
  @ApiPropertyOptional({
    example: 'Home',
    description: 'Optional label for the address',
    nullable: true,
    maxLength: 100,
  })
  label?: string | null;
  @ApiPropertyOptional({
    example: 'North District',
    description: 'Region of the address',
    nullable: true,
    maxLength: 100,
  })
  region?: string | null;
  @ApiPropertyOptional({
    example: 'Al Remal',
    description: 'Area of the address',
    nullable: true,
    maxLength: 100,
  })
  area?: string | null;
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
}
