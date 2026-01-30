import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({
    description: 'ID of the medicine being added to inventory',
  })
  medicineId!: number;

  @ApiProperty({
    example: 50,
    description: 'Initial stock quantity available in pharmacy',
  })
  stockQuantity!: number;

  @ApiProperty({
    example: 8.5,
    description: 'Selling price per unit',
  })
  sellPrice!: number;

  @ApiPropertyOptional({
    nullable: true,
    example: 6.25,
    description: 'Cost price per unit (optional)',
  })
  costPrice?: number | null;

  @ApiPropertyOptional({
    example: 5,
    description: 'Minimum stock',
  })
  minStock?: number;

  @ApiPropertyOptional({
    nullable: true,
    example: 'BATCH-2026-01',
    description: 'Batch number',
  })
  batchNumber?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '2026-01-01T00:00:00.000Z',
  })
  expiryDate?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Shelf A3',
    description: 'Physical shelf or storage location in pharmacy',
  })
  shelfLocation?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Internal notes',
  })
  notes?: string | null;
}
export type CreateInventoryItemDtoType = InstanceType<
  typeof CreateInventoryItemDto
>;
