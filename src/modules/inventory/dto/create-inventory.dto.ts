import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty()
  medicineId!: number;

  @ApiProperty()
  stockQuantity!: number;

  @ApiProperty()
  sellPrice!: number;

  @ApiPropertyOptional({ nullable: true })
  costPrice?: number | null;

  @ApiPropertyOptional({ default: 0 })
  minStock?: number;

  @ApiPropertyOptional({ nullable: true })
  batchNumber?: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  expiryDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  shelfLocation?: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes?: string | null;
}
export type CreateInventoryItemDtoType = InstanceType<typeof CreateInventoryItemDto>;