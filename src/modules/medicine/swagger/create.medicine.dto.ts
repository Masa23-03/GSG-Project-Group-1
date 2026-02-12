import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineImageInputDto } from './image.medicine.dto';

export class CreateMedicineAdminDto {
  @ApiProperty({ example: 1 })
  categoryId!: number;

  @ApiProperty({ minLength: 2, example: 'Panadol' })
  genericName!: string;

  @ApiPropertyOptional({ example: 'Panadol Extra' })
  brandName?: string;

  @ApiPropertyOptional({ example: 'GSK' })
  manufacturer?: string;

  @ApiPropertyOptional({ example: 'Tablet' })
  dosageForm?: string;

  @ApiPropertyOptional({ description: 'Decimal string', example: '500' })
  strengthValue?: string;

  @ApiPropertyOptional({ example: 'mg' })
  strengthUnit?: string;

  @ApiPropertyOptional({ example: 24 })
  packSize?: number;

  @ApiPropertyOptional({ example: 'tablets' })
  packUnit?: string;

  @ApiPropertyOptional({ example: false, default: false })
  requiresPrescription?: boolean;

  @ApiPropertyOptional({ example: 'Paracetamol' })
  activeIngredients?: string;

  @ApiPropertyOptional({ example: 'Take after food.' })
  dosageInstructions?: string;

  @ApiPropertyOptional({ example: 'Store in a cool place.' })
  storageInstructions?: string;

  @ApiPropertyOptional({ example: 'Do not exceed dose.' })
  warnings?: string;

  @ApiProperty({ example: 'Pain relief medicine...' })
  description!: string;

  @ApiProperty({ description: 'Decimal string', example: '10.50' })
  minPrice!: string;

  @ApiProperty({ description: 'Decimal string', example: '12.50' })
  maxPrice!: string;

  @ApiPropertyOptional({
    type: [MedicineImageInputDto],
    description: 'Optional medicine images (unique sortOrder per item)',
  })
  images?: MedicineImageInputDto[];
}

export class CreateMedicinePharmacyRequestDto {
  @ApiProperty({ example: 1 })
  categoryId!: number;

  @ApiProperty({ minLength: 2, example: 'Panadol' })
  genericName!: string;

  @ApiPropertyOptional({ example: 'Panadol Extra' })
  brandName?: string;

  @ApiPropertyOptional({ example: 'GSK' })
  manufacturer?: string;

  @ApiPropertyOptional({ example: 'Tablet' })
  dosageForm?: string;

  @ApiPropertyOptional({ description: 'Decimal string', example: '500' })
  strengthValue?: string;

  @ApiPropertyOptional({ example: 'mg' })
  strengthUnit?: string;

  @ApiPropertyOptional({ example: 24 })
  packSize?: number;

  @ApiPropertyOptional({ example: 'tablets' })
  packUnit?: string;

  @ApiPropertyOptional({ example: false }) requiresPrescription?: boolean;

  @ApiPropertyOptional({ example: 'Paracetamol' })
  activeIngredients?: string;

  @ApiPropertyOptional({ example: 'Take after food.' })
  dosageInstructions?: string;

  @ApiPropertyOptional({ example: 'Store in a cool place.' })
  storageInstructions?: string;

  @ApiPropertyOptional({ example: 'Do not exceed dose.' })
  warnings?: string;

  @ApiProperty({ example: 'Pain relief medicine...' }) description!: string;

  @ApiPropertyOptional({
    type: [MedicineImageInputDto],
    description: 'Optional medicine images (unique sortOrder per item)',
  })
  images?: MedicineImageInputDto[];
}
