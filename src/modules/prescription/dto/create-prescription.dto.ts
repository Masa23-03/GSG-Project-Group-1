import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionFileDto {
  @ApiProperty({
    description: 'Public URL of the uploaded prescription file.',
  })
  url!: string;
  @ApiPropertyOptional({
    description: 'Optional display order for this file.',
    example: 1,
  })
  sortOrder?: number;
}
export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'Pharmacy ID that this prescription belongs to.',
    example: 12,
  })
  pharmacyId!: number;
  @ApiProperty({
    description:
      'List of uploaded prescription files (URLs). Must include at least one file.',
    type: [CreatePrescriptionFileDto],
  })
  files!: CreatePrescriptionFileDto[];
}
export class ReuploadPrescriptionDto {
  @ApiProperty({
    description:
      'New set of prescription files (URLs) for re-upload. Must include at least one file.',
    type: [CreatePrescriptionFileDto],
  })
  files!: CreatePrescriptionFileDto[];
}
