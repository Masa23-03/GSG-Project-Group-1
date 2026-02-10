import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrescriptionStatus } from '@prisma/client';
export class PrescriptionFileResponseDto {
  @ApiProperty({
    description: 'Prescription file record ID.',
    example: 101,
  })
  id!: number;
  @ApiProperty({
    description: 'Public URL of the stored prescription file.',
  })
  url!: string;
  @ApiProperty({
    description: 'Display order of the file (1..n).',
    example: 1,
  })
  sortOrder!: number;
}
export class PrescriptionResponseDto {
  @ApiProperty({
    description: 'Prescription ID.',
    example: 13,
  })
  id!: number;
  @ApiProperty({
    description: 'Current review status of the prescription.',
    enum: PrescriptionStatus,
    example: PrescriptionStatus.UNDER_REVIEW,
  })
  status!: PrescriptionStatus;
  @ApiPropertyOptional({
    description:
      'Reason for re-upload request (set by pharmacy). Null if no re-upload is currently requested or after successful re-upload.',
    example:
      'Please upload a clearer photo showing the full prescription details.',
    nullable: true,
  })
  reuploadReason?: string | null;
  @ApiPropertyOptional({
    description: 'Timestamp when pharmacy requested re-upload.',
    example: '2026-02-08T12:34:56.000Z',
    nullable: true,
  })
  reuploadRequestedAt?: string | null;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-02-08T10:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-02-08T11:15:00.000Z',
  })
  updatedAt!: string;
  @ApiProperty({
    description:
      'Whether this is the active prescription version for its pharmacy order context.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Prescription files (ordered by sortOrder).',
    type: [PrescriptionFileResponseDto],
  })
  files!: PrescriptionFileResponseDto[];
}
