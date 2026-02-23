import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineStatus } from '@prisma/client';
import { MedicineImageDto } from './image.medicine.dto';

export class MedicineDataDto {
  @ApiProperty({ example: 12 })
  id!: number;
  @ApiProperty({ example: 5 })
  categoryId!: number;

  @ApiProperty({ example: 'Paracetamol' })
  genericName!: string;
  @ApiPropertyOptional({ example: 'Panadol', nullable: true })
  brandName?: string | null;
  @ApiPropertyOptional({ example: 'GSK', nullable: true })
  manufacturer?: string | null;
  @ApiPropertyOptional({ example: 'Tablet', nullable: true })
  dosageForm?: string | null;

  @ApiPropertyOptional({
    description: 'Decimal as string',
    example: '500',
    nullable: true,
  })
  strengthValue?: string | null;

  @ApiPropertyOptional({ example: 'mg', nullable: true })
  strengthUnit?: string | null;
  @ApiPropertyOptional({ example: 24, nullable: true })
  packSize?: number | null;
  @ApiPropertyOptional({ example: 'tablets', nullable: true })
  packUnit?: string | null;

  @ApiProperty({ example: false })
  requiresPrescription!: boolean;

  @ApiPropertyOptional({ example: 'Paracetamol', nullable: true })
  activeIngredients?: string | null;
  @ApiPropertyOptional({ example: 'Take after food', nullable: true })
  dosageInstructions?: string | null;
  @ApiPropertyOptional({ example: 'Store in a cool place', nullable: true })
  storageInstructions?: string | null;
  @ApiPropertyOptional({ example: 'Do not exceed dose', nullable: true })
  warnings?: string | null;

  @ApiProperty({ example: 'Pain relief medicine...' })
  description!: string;

  @ApiProperty({ enum: MedicineStatus, example: MedicineStatus.APPROVED })
  status!: MedicineStatus;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({
    description: 'Decimal as string',
    example: '10.50',
    nullable: true,
  })
  minPrice?: string | null;

  @ApiPropertyOptional({
    description: 'Decimal as string',
    example: '12.50',
    nullable: true,
  })
  maxPrice?: string | null;

  @ApiProperty({ example: '2026-02-12T12:34:56.000Z', format: 'date-time' })
  createdAt!: Date;
  @ApiProperty({ example: '2026-02-12T12:34:56.000Z', format: 'date-time' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: '2026-02-12T12:34:56.000Z',
    format: 'date-time',
    nullable: true,
  })
  reviewedAt?: Date | null;
  @ApiPropertyOptional({
    example: 'Missing required documents',
    nullable: true,
  })
  rejectionReason?: string | null;
  @ApiPropertyOptional({ example: 9, nullable: true })
  createdByUserId?: number | null;
  @ApiPropertyOptional({ example: 22, nullable: true })
  requestedByPharmacyId?: number | null;
  @ApiPropertyOptional({ example: 1, nullable: true })
  reviewedBy?: number | null;

  @ApiProperty({ type: [MedicineImageDto] })
  medicineImages!: MedicineImageDto[];
}
