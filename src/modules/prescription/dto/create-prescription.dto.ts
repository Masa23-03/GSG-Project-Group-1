import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'Pharmacy ID that this prescription belongs to.',
    example: 12,
  })
  pharmacyId!: number;
  @ApiProperty({
    description:
      'Uploaded prescription file URLs. Order in array = display order.',
    type: [String],
  })
  fileUrls!: string[];
}
export class ReuploadPrescriptionDto {
  @ApiProperty({
    description: 'Uploaded prescription file URLs.',
    type: [String],
  })
  fileUrls!: string[];
}
