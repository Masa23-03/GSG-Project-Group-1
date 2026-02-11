import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
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
