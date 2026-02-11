import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/types/pagination.query';
import { StockStatus } from '../response.dto/InventoryListItem.dto';

export class GetInventoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    type: 'string',
    description: 'Search by medicine generic or brand name',
  })
  q?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Filter by a specific medicine',
  })
  medicineId?: number;

  @ApiPropertyOptional({
    enum: StockStatus,
    description:
      'Filter by stock status (IN_STOCK / LOW_STOCK / OUT_OF_STOCK). If omitted, returns ALL.',
  })
  stockStatus?: StockStatus;
}
