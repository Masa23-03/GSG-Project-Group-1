import { ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineStatus } from '@prisma/client';
import { PaginationQueryDto } from 'src/types/pagination.query';

export class MedicineListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'panadol' })
  q?: string;

  @ApiPropertyOptional({ example: 1 })
  categoryId?: number;
}
export class PatientMedicineListQueryDto extends MedicineListQueryDto {
  @ApiPropertyOptional({ example: true })
  requiresPrescription?: boolean;

  @ApiPropertyOptional({ example: 5 })
  minPrice?: number;

  @ApiPropertyOptional({ example: 50 })
  maxPrice?: number;
}
export class AdminMedicineListQueryDto extends MedicineListQueryDto {
  @ApiPropertyOptional({ enum: MedicineStatus })
  status?: MedicineStatus;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}

export class PharmacyMedicineListQueryDto extends MedicineListQueryDto {}

export type PharmacyRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export class PharmacyRequestsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  status?: PharmacyRequestStatus;
}
