import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto, SortOrder } from 'src/types/pagination.query';
import { OrderStatus } from '@prisma/client';
import { getAdminOrderQuerySchema } from '../../schema/admin-order-query.schema';

export enum OrderFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
export enum PharmacyOrderFilter {
  ALL = 'ALL',
  NEW = 'NEW',
  DELIVERED = 'DELIVERED',
  PAST = 'PAST',
}

export class PatientOrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Exact order ID.' })
  orderId?: number;

  @ApiPropertyOptional({ description: 'Exact pharmacy ID.' })
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
export class PharmacyOrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: PharmacyOrderFilter,
    example: PharmacyOrderFilter.ALL,
    description: 'Filter orders. Default: ALL.',
  })
  filter?: PharmacyOrderFilter;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Sort by createdAt. Default: desc.',
  })
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    description:
      'Free-text search across: orderId, pharmacyOrderId, patientId, patientName, medicine generic/brand name.',
  })
  q?: string;
}

export class GetAdminOrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Filter by order status',
  })
  status?: OrderStatus;

  @ApiPropertyOptional({
    description:
      'Free-text search across: orderID, patientName and pharmacyName',
  })
  q?: string;
}
export type PatientOrderQueryDtoType = InstanceType<
  typeof PatientOrderQueryDto
>;

export type PharmacyOrderQueryDtoType = InstanceType<
  typeof PharmacyOrderQueryDto
>;

export type GetAdminOrderQueryDtoType = InstanceType<
  typeof GetAdminOrderQueryDto
>;
