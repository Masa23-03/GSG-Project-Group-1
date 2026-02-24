import { ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineImageInputDto } from './image.medicine.dto';

export class UpdateMedicineDto {
  @ApiPropertyOptional({ example: 2 })
  categoryId?: number;

  @ApiPropertyOptional({ example: 'Panadol' })
  genericName?: string;

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

  @ApiPropertyOptional({ example: false })
  requiresPrescription?: boolean;

  @ApiPropertyOptional({ example: 'Paracetamol' })
  activeIngredients?: string;

  @ApiPropertyOptional({ example: 'Take after food.' })
  dosageInstructions?: string;

  @ApiPropertyOptional({ example: 'Store in a cool, dry place.' })
  storageInstructions?: string;

  @ApiPropertyOptional({ example: 'Do not exceed recommended dose.' })
  warnings?: string;

  @ApiPropertyOptional({ example: 'Pain relief medicine...' })
  description?: string;

  @ApiPropertyOptional({ description: 'Price (>= 0)', example: 10.5 })
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Price (>= 0)', example: 12.5 })
  maxPrice?: number;

  @ApiPropertyOptional({
    type: [MedicineImageInputDto],
    description: 'If provided, replaces all images',
  })
  images?: MedicineImageInputDto[];
}
