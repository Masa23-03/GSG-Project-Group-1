import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// TODO
// import { IsEnum, IsOptional, IsString, ValidateIf, Matches } from 'class-validator';

export class ToggleActiveDto {
    @ApiProperty({ example: true })
    isActive!: boolean;
}

export type ReviewStatus = 'APPROVED' | 'REJECTED'

export class AdminReviewDto {
    @ApiProperty({ enum: ['APPROVED', 'REJECTED'], example: 'APPROVED' })
    status!: ReviewStatus;

    @ApiPropertyOptional({ example: 'Missing required documents.' })
    // @ValidateIf(o => o.status === MedicineStatus.REJECTED)
    rejectionReason?: string;

    @ApiPropertyOptional({ description: 'Decimal string', example: '10.50' })
    minPrice?: string;

    @ApiPropertyOptional({ description: 'Decimal string', example: '12.50' })
    maxPrice?: string;

    //TODO : add require prescription 
}
