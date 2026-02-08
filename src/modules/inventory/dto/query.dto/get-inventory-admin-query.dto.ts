import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/types/pagination.query';

export class GetInventoryAdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    type: 'number',
    description: 'Filter by specific pharmacy',
  })
  pharmacyId?: number;

  @ApiPropertyOptional({
    type: 'number',
    description: 'Filter by specific medicine',
  })
  medicineId?: number;

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Filter by stock availability',
  })
  isAvailable?: boolean;

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Whether to include soft-deleted items',
    default: false,
  })
  includeDeleted?: boolean;
}
