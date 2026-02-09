import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/types/pagination.query';

export class GetInventoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    type: 'string',
    description: 'Search by medicine generic or brand name',
  })
  q?: string;

  @ApiPropertyOptional({ type: 'number' })
  medicineId?: number;

  @ApiPropertyOptional({ type: 'boolean' })
  isAvailable?: boolean;

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Filter items where stockQuantity <= minStock',
  })
  lowStock?: boolean;
}
