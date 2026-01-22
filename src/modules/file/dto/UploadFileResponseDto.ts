import { ApiProperty } from '@nestjs/swagger';
import { UploadPurpose } from '../types/file.types';

export class UploadFileResponseDto {
  @ApiProperty()
  fileId!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({ enum: UploadPurpose })
  purpose!: UploadPurpose;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  size!: number;
}
