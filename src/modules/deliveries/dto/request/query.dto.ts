import { ApiPropertyOptional } from '@nestjs/swagger';
import { SortOrder } from 'src/modules/order/dto/request.dto/order.query.dto';
import { PaginationQueryDto } from 'src/types/pagination.query';

export class DriverDeliveriesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,

    description: 'Sort by createdAt. Default: desc.',
  })
  sortOrder?: SortOrder;
}

export type DriverDeliveriesListQueryDtoType = InstanceType<
  typeof DriverDeliveriesListQueryDto
>;
