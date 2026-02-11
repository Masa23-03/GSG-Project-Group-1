import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Page number (starting from 1).',
  })
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of items per page (max 100).',
  })
  limit?: number;
}
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
type HasSortOrder = { sortOrder?: SortOrder };
export function buildCreatedAtOrderBy<T extends HasSortOrder>(
  query: T,
): { createdAt: Prisma.SortOrder } {
  return {
    createdAt:
      query.sortOrder === SortOrder.ASC
        ? Prisma.SortOrder.asc
        : Prisma.SortOrder.desc,
  };
}
