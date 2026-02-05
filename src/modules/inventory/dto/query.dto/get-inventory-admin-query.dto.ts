import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetInventoryAdminQueryDto {
  @ApiPropertyOptional({ description: 'Filter by specific pharmacy' })
  pharmacyId?: number;

  @ApiPropertyOptional({ description: 'Filter by specific medicine' })
  medicineId?: number;

  @ApiPropertyOptional({ description: 'Filter by stock availability' })
  isAvailable?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether to include soft-deleted items', 
    default: false 
  })
  includeDeleted?: boolean;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  limit?: number;
}