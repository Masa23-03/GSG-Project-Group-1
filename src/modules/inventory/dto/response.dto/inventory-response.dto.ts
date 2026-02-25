import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineStatus } from '@prisma/client';
import { PharmacySummaryDto } from './inventory-admin-response.dto';

export class MedicineDto {
  @ApiProperty({ type: Number, example: 5, description: 'Medicine ID' })
  id!: number;
  @ApiProperty({
    type: String,
    example: 'Paracetamol',
    description: 'Generic name of the medicine',
  })
  genericName!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Panadol',
    description: 'Brand name (if available)',
  })
  brandName?: string | null;

  @ApiProperty({
    enum: MedicineStatus,
    example: MedicineStatus.APPROVED,
    description: 'Medicine approval status',
  })
  status!: MedicineStatus;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the medicine is active/visible in the system',
  })
  isActive!: boolean;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    example: 8.5,
    description: 'Minimum price across pharmacies (if computed)',
  })
  minPrice?: number | null;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    example: 12.0,
    description: 'Maximum price across pharmacies (if computed)',
  })
  maxPrice?: number | null;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Whether the medicine requires a prescription',
  })
  requiresPrescription!: boolean;

  @ApiProperty({
    type: Number,
    example: 2,
    description: 'Category ID the medicine belongs to',
  })
  categoryId!: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'GSK',
    description: 'Manufacturer name (if provided)',
  })
  manufacturer?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Tablet',
    description: 'Dosage form (Tablet / Syrup / Capsule ...)',
  })
  dosageForm?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Take 1 tablet every 8 hours',
    description: 'Dosage instructions',
  })
  dosageInstructions?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Store below 25°C',
    description: 'Storage instructions',
  })
  storageInstructions?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Do not exceed 4g per day',
    description: 'Warnings/cautions',
  })
  warnings?: string | null;

  @ApiProperty({
    type: String,
    example: 'Pain reliever and fever reducer',
    description: 'Medicine description',
  })
  description!: string;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    example: 12,
    description: 'Pack size (number of units per pack)',
  })
  packSize?: number | null;
}

class MedicineImageDto {
  @ApiProperty() imageUrl!: string;
  @ApiPropertyOptional() sortOrder?: number;
}

export class InventoryItemResponseDto {
  @ApiProperty({ type: Number, example: 13, description: 'Inventory item ID' })
  id!: number;

  @ApiProperty({ type: Number, example: 5, description: 'Medicine ID' })
  medicineId!: number;

  @ApiProperty({ type: Number, example: 12, description: 'Pharmacy ID' })
  pharmacyId!: number;

  @ApiProperty({
    type: Number,
    example: 120,
    description: 'Current stock quantity',
  })
  stockQuantity!: number;

  @ApiProperty({
    type: Number,
    example: 20,
    description: 'Minimum stock threshold',
  })
  minStock!: number;

  @ApiProperty({
    type: Number,
    example: 15.5,
    description: 'Selling price per unit',
  })
  sellPrice!: number;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    example: 12.0,
    description: 'Cost price per unit',
  })
  costPrice?: number | null;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the pharmacy is selling this item right now',
  })
  isAvailable!: boolean;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'BATCH-2026-01',
    description: 'Batch number',
  })
  batchNumber?: string | null;
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    format: 'date',
    example: '2026-12-01',
    description: 'Expiry date (YYYY-MM-DD)',
  })
  expiryDate?: string | null;
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Shelf A3',
    description: 'Storage location inside the pharmacy',
  })
  shelfLocation?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Keep away from sunlight',
    description: 'Internal pharmacy notes',
  })
  notes?: string | null;

  @ApiProperty({
    type: MedicineDto,
    description: 'Medicine details for this inventory item',
  })
  medicine!: MedicineDto;
  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-02-11T17:30:00.000Z',
    description: 'Created timestamp',
  })
  createdAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-02-11T18:10:00.000Z',
    description: 'Last updated timestamp',
  })
  updatedAt!: string;

  @ApiProperty({ type: [MedicineImageDto] })
  medicineImages!: MedicineImageDto[];
}

export class InventoryAdminDetailsResponseDto extends InventoryItemResponseDto {
  @ApiProperty({ type: PharmacySummaryDto })
  pharmacy!: PharmacySummaryDto;
}

export type MedicineDtoType = InstanceType<typeof MedicineDto>;
export type InventoryItemResponseDtoType = InstanceType<
  typeof InventoryItemResponseDto
>;
