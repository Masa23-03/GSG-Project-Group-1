import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientAddress } from '@prisma/client';
export class CreatePatientAddressDto {
  @ApiProperty({ description: "City ID of the patient's address" })
  cityId!: number;
  @ApiProperty({
    example: 'Al Remal Street, Building 5',
    description: 'Primary address line',
  })
  addressLine1!: string;
  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is the default address for the patient',
    nullable: true,
  })
  isDefault?: boolean | null;
  @ApiPropertyOptional({
    example: 'Apartment 3B',
    description: 'Secondary address line',
    nullable: true,
  })
  addressLine2?: string | null;
  @ApiPropertyOptional({
    example: 'Home',
    description: 'Optional label for the address',
    nullable: true,
  })
  label?: string | null;
  @ApiPropertyOptional({
    example: 'North District',
    description: 'Region of the address',
    nullable: true,
  })
  region?: string | null;
  @ApiPropertyOptional({
    example: 'Al Remal',
    description: 'Area of the address',
    nullable: true,
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
