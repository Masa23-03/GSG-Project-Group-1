import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineStatus } from '@prisma/client';
import { MedicineImageDto } from './image.medicine.dto';

export class PaginationMetaDto {
    @ApiProperty({ example: 1 }) 
    page!: number;
    @ApiProperty({ example: 10 }) 
    limit!: number;
    @ApiProperty({ example: 42 }) 
    total!: number;
    @ApiProperty({ example: 5 }) 
    totalPages!: number;
}

export class ErrorFieldDto {
    @ApiProperty() field!: string;
    @ApiProperty() message!: string;
}

export class ApiErrorResponseDto {
    @ApiProperty({ example: false }) success!: boolean;
    @ApiProperty({ example: 'Validation failed' }) message!: string;
    @ApiProperty({ example: '2026-02-11T12:34:56.000Z' }) timestamp!: string;
    @ApiProperty({ example: 400 }) statusCode!: number;
    @ApiProperty({ example: '/medicines' }) path!: string;
    @ApiPropertyOptional({ type: [ErrorFieldDto] })
    fields?: ErrorFieldDto[];
}

export class MedicineDataDto {
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

    @ApiProperty({ enum: MedicineStatus })
    status!: MedicineStatus;

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



export class MedicineListResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ type: [MedicineDataDto] })
    data!: MedicineDataDto[];

    @ApiProperty({ type: PaginationMetaDto })
    meta!: PaginationMetaDto;
}

export class MedicineResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ type: MedicineDataDto })
    data!: MedicineDataDto;
}

