import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetInventoryQueryDto {
  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by medicine generic or brand name' })
  q?: string;

  @ApiPropertyOptional()
  medicineId?: number;

  @ApiPropertyOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Filter items where stockQuantity <= minStock' })
  lowStock?: boolean;
}