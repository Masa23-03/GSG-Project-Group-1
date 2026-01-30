import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicineSummaryDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  genericName!: string;
  @ApiPropertyOptional({ nullable: true, example: 'Panadol' })
  brandName?: string | null;
  @ApiProperty()
  status!: string;
  @ApiProperty()
  isActive!: boolean;
  @ApiProperty({ required: false, nullable: true })
  minPrice?: number | null;
  @ApiProperty({ required: false, nullable: true })
  maxPrice?: number | null;
  @ApiProperty()
  requiresPrescription!: boolean;
  @ApiProperty()
  categoryId!: string;
  @ApiProperty({ required: false, nullable: true })
  manufacturer?: string | null;
  @ApiProperty({ required: false, nullable: true })
  dosageForm?: string | null;
  @ApiProperty({ required: false, nullable: true })
  dosageInstructions?: string | null;
  @ApiProperty({ required: false, nullable: true })
  storageInstructions?: string | null;
  @ApiProperty({ required: false, nullable: true })
  warnings?: string | null;
  @ApiProperty()
  description!: string;
  @ApiProperty({ required: false, nullable: true })
  packSize?: string | null;
}

export class InventoryItemResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  medicineId!: number;

  @ApiProperty()
  pharmacyId!: number;

  @ApiProperty()
  stockQuantity!: number;

  @ApiProperty()
  minStock!: number;

  @ApiProperty()
  sellPrice!: number;

  @ApiProperty({ required: false, nullable: true })
  costPrice?: number | null;

  @ApiProperty()
  isAvailable!: boolean;

  @ApiProperty({ required: false, nullable: true })
  batchNumber?: string | null;

  @ApiProperty({ required: false, nullable: true, format: 'date-time' })
  expiryDate?: string | null;
  @ApiProperty({ required: false, nullable: true })
  shelfLocation?: string | null;

  @ApiProperty({ required: false, nullable: true })
  notes?: string | null;

  @ApiProperty({
    type: MedicineSummaryDto,
  })
  medicine!: MedicineSummaryDto;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export type MedicineSummaryDtoType = InstanceType<typeof MedicineSummaryDto>;
export type InventoryItemResponseDtoType = InstanceType<
  typeof InventoryItemResponseDto
>;
