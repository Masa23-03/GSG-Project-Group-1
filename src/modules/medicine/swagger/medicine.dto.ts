import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineStatus } from '@prisma/client';
import { MedicineImageDto } from './image.medicine.dto';

export class PaginationMetaDto {
    @ApiProperty() page!: number;
    @ApiProperty() limit!: number;
    @ApiProperty() total!: number;
    @ApiProperty() totalPages!: number;
}



export class MedicineDto {
    @ApiProperty() id!: number;
    @ApiProperty() categoryId!: number;

    @ApiProperty() genericName!: string;
    @ApiPropertyOptional() brandName?: string | null;
    @ApiPropertyOptional() manufacturer?: string | null;
    @ApiPropertyOptional() dosageForm?: string | null;

    @ApiPropertyOptional({ description: 'Decimal as string' })
    strengthValue?: string | null;

    @ApiPropertyOptional() strengthUnit?: string | null;
    @ApiPropertyOptional() packSize?: number | null;
    @ApiPropertyOptional() packUnit?: string | null;

    @ApiProperty() requiresPrescription!: boolean;

    @ApiPropertyOptional() activeIngredients?: string | null;
    @ApiPropertyOptional() dosageInstructions?: string | null;
    @ApiPropertyOptional() storageInstructions?: string | null;
    @ApiPropertyOptional() warnings?: string | null;

    @ApiProperty() description!: string;

    @ApiProperty({ enum: MedicineStatus }) status!: MedicineStatus;
    @ApiProperty() isActive!: boolean;

    @ApiPropertyOptional({ description: 'Decimal as string' })
    minPrice?: string | null;

    @ApiPropertyOptional({ description: 'Decimal as string' })
    maxPrice?: string | null;

    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;

    @ApiPropertyOptional() reviewedAt?: Date | null;
    @ApiPropertyOptional() rejectionReason?: string | null;

    @ApiPropertyOptional() createdByUserId?: number | null;
    @ApiPropertyOptional() requestedByPharmacyId?: number | null;
    @ApiPropertyOptional() reviewedBy?: number | null;

    @ApiProperty({ type: [MedicineImageDto] })
    medicineImages!: MedicineImageDto[];
}




