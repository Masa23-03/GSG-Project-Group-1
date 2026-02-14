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
      'Distance filter in KM. Applied only when both patient default address coordinates and pharmacy coordinates exist. If coordinates are missing, this filter will not be applied.',
    example: 5,
    minimum: 0.1,
  })
  radiusKm?: number;
  @ApiPropertyOptional({
    description:
      'Optional city filter. If provided, pharmacies will be limited to this city. Used especially when distance cannot be computed.',
    example: 2,
    minimum: 1,
  })
  cityId?: number;
}

export type PatientPharmaciesQueryDtoType = InstanceType<
  typeof PatientPharmaciesQueryDto
>;
