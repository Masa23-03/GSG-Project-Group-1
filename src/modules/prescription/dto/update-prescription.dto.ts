import { ApiProperty } from '@nestjs/swagger';

export class RequestNewPrescriptionDto {
  @ApiProperty({
    description: 'Reason the pharmacy is requesting a re-upload.',
    example: 'Image is blurry.',
  })
  reuploadReason!: string;
}
