import { ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineStatus } from '@prisma/client';
import { PaginationQueryDto } from 'src/types/pagination.query';

export class MedicineListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  q?: string;

  @ApiPropertyOptional()
  categoryId?: number;
}
export class PatientMedicineListQueryDto extends MedicineListQueryDto {
  @ApiPropertyOptional()
  requiresPrescription?: boolean;
  @ApiPropertyOptional({ default: false })
  onlyAvailable?: boolean;

  @ApiPropertyOptional()
  minPrice?: number;

  @ApiPropertyOptional()
  maxPrice?: number;
}
export class AdminMedicineListQueryDto extends MedicineListQueryDto {
  @ApiPropertyOptional({ enum: MedicineStatus })
  status?: MedicineStatus;

  @ApiPropertyOptional()
  isActive?: boolean;
}

export class PharmacyMedicineListQueryDto extends MedicineListQueryDto {}

export type PharmacyRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export class PharmacyRequestsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  status?: PharmacyRequestStatus;
}
