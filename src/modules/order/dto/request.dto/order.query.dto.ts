import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/types/pagination.query';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum OrderFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class PatientOrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 13, description: 'Exact order ID.' })
  orderId?: number;

  @ApiPropertyOptional({ example: 12, description: 'Exact pharmacy ID.' })
  pharmacyId?: number;

  @ApiPropertyOptional({
    example: 'Shifa',
    description: 'Search by pharmacy name (contains).',
  })
  pharmacyName?: string;

  @ApiPropertyOptional({
    enum: OrderFilter,
    example: OrderFilter.ALL,
    description: 'Filter orders. Default: ALL.',
  })
  filter?: OrderFilter;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Sort by createdAt. Default: desc.',
  })
  sortOrder?: SortOrder;
}

export type PatientOrderQueryDtoType = InstanceType<
  typeof PatientOrderQueryDto
>;
