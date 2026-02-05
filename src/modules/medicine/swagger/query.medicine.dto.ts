import { ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineStatus } from '@prisma/client';

export class PatientMedicineListQueryDto {
    @ApiPropertyOptional({ example: 'panadol' }) 
    q?: string;

    @ApiPropertyOptional({ example: 1 }) 
    categoryId?: number;

    @ApiPropertyOptional({ example: 1 }) 
    page?: number;

    @ApiPropertyOptional({ example: 10 }) 
    limit?: number;

}

export class AdminMedicineListQueryDto extends PatientMedicineListQueryDto {
    @ApiPropertyOptional({ enum: MedicineStatus }) 
    status?: MedicineStatus;

    @ApiPropertyOptional({ example: true }) 
    isActive?: boolean;

}

export class PharmacyMedicineListQueryDto extends PatientMedicineListQueryDto { }


export type PharmacyRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export class PharmacyRequestsListQueryDto {
    @ApiPropertyOptional({ enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'PENDING' })
    status?: PharmacyRequestStatus;

    @ApiPropertyOptional({ example: 1 }) 
    page?: number;

    @ApiPropertyOptional({ example: 10 }) 
    limit?: number;

}
