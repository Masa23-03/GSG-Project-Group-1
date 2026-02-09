import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/types/pagination.query';

export enum PharmacyScope {
  nearby = 'nearby',
  all = 'all',
}
export class PatientPharmaciesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: PharmacyScope,
    default: PharmacyScope.nearby,
    description:
      'Controls the listing mode. "nearby" computes distance when lat/lng are provided. "all" ignores distance logic and sorts by name.',
    example: PharmacyScope.nearby,
  })
  scope?: PharmacyScope;
  @ApiPropertyOptional({
    description: 'Search by pharmacy name.',
    example: 'Shifa',
    minLength: 1,
  })
  q?: string;
  @ApiPropertyOptional({
    description:
      'Patient latitude. Must be provided together with lng. Used only when scope=nearby.',
    example: 31.5204,
    minimum: -90,
    maximum: 90,
  })
  lat?: number;

  @ApiPropertyOptional({
    description:
      'Patient longitude. Must be provided together with lat. Used only when scope=nearby.',
    example: 34.4531,
    minimum: -180,
    maximum: 180,
  })
  lng?: number;

  @ApiPropertyOptional({
    description:
      'Radius filter in KM. Applied only when lat/lng are provided. Must be a positive number.',
    example: 5,
    minimum: 0.1,
  })
  radiusKm?: number;
  @ApiPropertyOptional({
    description:
      'Fallback filter when scope=nearby and lat/lng are not provided. Filters pharmacies by cityId.',
    example: 2,
    minimum: 1,
  })
  cityId?: number;
}

export type PatientPharmaciesQueryDtoType = InstanceType<
  typeof PatientPharmaciesQueryDto
>;
