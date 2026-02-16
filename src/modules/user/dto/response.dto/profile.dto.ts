import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

//default address Dto:
export class DefaultAddressDto {
  @ApiProperty({ example: 12 }) id!: number;
  @ApiPropertyOptional({ example: 'Home', nullable: true }) label?:
    | string
    | null;

  @ApiPropertyOptional({ example: 'Al-Rimal', nullable: true })
  area?: string | null;

  @ApiPropertyOptional({ example: 'Gaza', nullable: true })
  region?: string | null;

  @ApiProperty({ example: 'Street 10, Building 3' })
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'Apartment 5', nullable: true })
  addressLine2?: string | null;

  @ApiPropertyOptional({ example: 31.5017, nullable: true })
  latitude?: number | null;

  @ApiPropertyOptional({ example: 34.4668, nullable: true })
  longitude?: number | null;

  @ApiProperty({ example: 'Gaza' })
  cityName!: string;

  @ApiProperty({ example: 1 })
  cityId!: number;
}
//patient profile:
export class UserMeResponseDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ enum: UserRole, example: UserRole.PATIENT })
  role!: UserRole;

  @ApiProperty({ example: 'shahd@email.com' })
  email!: string;

  @ApiProperty({ example: '+970599000000' })
  phoneNumber!: string;

  @ApiProperty({ example: 'Shahd' })
  name!: string;

  @ApiPropertyOptional({
    example: '2002-04-26',
    nullable: true,
    format: 'date',
  })
  dateOfBirth?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/profiles/123.png',
    nullable: true,
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({ type: DefaultAddressDto, nullable: true })
  defaultAddress?: DefaultAddressDto | null;

  @ApiProperty({ example: '2026-02-16T14:12:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-16T15:01:00.000Z', format: 'date-time' })
  updatedAt!: string;
}
