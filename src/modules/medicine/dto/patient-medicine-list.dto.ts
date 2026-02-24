import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PatientMedicineImageDto {
  @ApiProperty()
  url!: string;

  @ApiProperty()
  sortOrder!: number;
}

class PatientMedicineCategoryDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}

export class PatientMedicineListItemDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  genericName!: string;

  @ApiPropertyOptional()
  brandName?: string | null;

  @ApiPropertyOptional()
  dosageForm?: string | null;

  @ApiPropertyOptional()
  strengthValue?: string | null;

  @ApiPropertyOptional()
  strengthUnit?: string | null;

  @ApiPropertyOptional()
  minPrice?: string | null;

  @ApiPropertyOptional()
  maxPrice?: string | null;

  @ApiProperty({ type: [PatientMedicineImageDto] })
  images!: PatientMedicineImageDto[];

  @ApiProperty({ type: PatientMedicineCategoryDto })
  category!: PatientMedicineCategoryDto;

  @ApiProperty()
  requiresPrescription!: boolean;

  @ApiPropertyOptional()
  manufacturer?: string | null;

  @ApiPropertyOptional()
  packSize?: number | null;

  @ApiPropertyOptional()
  packUnit?: string | null;
}
