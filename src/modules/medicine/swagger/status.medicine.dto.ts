import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineStatus } from '@prisma/client';

export class ToggleActiveDto {
  @ApiProperty({ example: true })
  isActive!: boolean;
}

export type ReviewStatus = 'APPROVED' | 'REJECTED';

export class AdminReviewDto {
  @ApiProperty({
    enum: [MedicineStatus.APPROVED, MedicineStatus.REJECTED],
    example: MedicineStatus.APPROVED,
    description: 'Admin decision for the medicine request',
  })
  status!: ReviewStatus;

  @ApiPropertyOptional({
    example: 'Missing required documents.',
    nullable: true,
    description: 'Required when status is REJECTED',
  })
  // @ValidateIf(o => o.status === MedicineStatus.REJECTED)
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Decimal string (>= 0)',
    example: '10.50',
    nullable: true,
  })
  minPrice?: string;

  @ApiPropertyOptional({
    description: 'Decimal string (>= 0)',
    example: '12.50',
    nullable: true,
  })
  maxPrice?: string;

  //TODO : add require prescription
}
