import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PharmacySummaryDto } from './inventory-admin-response.dto';

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export class InventoryListItemDto {
  @ApiProperty({ type: Number, example: 13, description: 'Inventory item ID' })
  id!: number;
  @ApiProperty({
    type: Number,
    example: 5,
    description: 'Medicine ID for this inventory item',
  })
  medicineId!: number;
  @ApiProperty({
    type: String,
    example: 'Panadol 500mg Tablet',
    description:
      'Computed medicine display name (brand/generic + strength + dosage form)',
  })
  medicineName!: string;
  @ApiProperty({
    type: String,
    example: 'Pain Relief',
    description: 'Medicine category name',
  })
  categoryName!: string;
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '1 Pack (12 tablets)',
    description: 'Computed pack display label',
  })
  packDisplayName?: string | null;
  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Whether this medicine requires a prescription',
  })
  requiresPrescription!: boolean;
  @ApiProperty({
    type: Number,
    example: 120,
    description: 'Current available stock quantity for this inventory item',
  })
  stockQuantity!: number;
  @ApiProperty({
    type: Number,
    example: 20,
    description: 'Minimum stock threshold for LOW_STOCK state',
  })
  minStock!: number;

  @ApiProperty({
    type: Number,
    example: 15.5,
    description: 'Sell price for this inventory item',
  })
  sellPrice!: number;
  @ApiProperty({
    enum: StockStatus,
    example: StockStatus.IN_STOCK,
    description: 'Computed stock status based on stockQuantity and minStock',
  })
  stockStatus!: StockStatus;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    format: 'date',
    example: '2026-12-01',
    description: 'Expiry date (YYYY-MM-DD)',
  })
  expiryDate?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'First medicine image URL',
  })
  medicineImageUrl?: string | null;
}
export class InventoryAdminListItemResponseDto extends InventoryListItemDto {
  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Whether this inventory item is deleted',
  })
  isDeleted!: boolean;
  @ApiProperty({
    type: PharmacySummaryDto,
    description: 'Pharmacy summary for admin context',
  })
  pharmacy!: PharmacySummaryDto;
}
export class PatientInventoryListItemDto {
  @ApiProperty({ type: Number, example: 13, description: 'Inventory item ID' })
  id!: number;

  @ApiProperty({ type: Number, example: 5, description: 'Medicine ID' })
  medicineId!: number;

  @ApiProperty({
    type: String,
    example: 'Panadol 500mg Tablet',
    description: 'Medicine display name',
  })
  medicineName!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'https://cdn.example.com/panadol.jpg',
    description: 'Primary medicine image',
  })
  imageUrl?: string | null;

  @ApiProperty({
    type: Number,
    example: 15.5,
    description: 'Sell price per unit',
  })
  sellPrice!: number;

  @ApiProperty({ type: Boolean, example: false })
  requiresPrescription!: boolean;

  @ApiProperty({ enum: StockStatus, example: StockStatus.IN_STOCK })
  stockStatus!: StockStatus;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '1 Pack (12 tablets)',
  })
  packDisplayName?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'First medicine image URL',
  })
  medicineImageUrl?: string | null;
}
