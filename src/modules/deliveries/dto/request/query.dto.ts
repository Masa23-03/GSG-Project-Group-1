import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto, SortOrder } from 'src/types/pagination.query';

export class DriverDeliveriesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,

    description: 'Sort by createdAt. Default: desc.',
  })
  sortOrder?: SortOrder;
}
