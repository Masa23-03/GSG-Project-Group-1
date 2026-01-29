import { ApiProperty } from '@nestjs/swagger';
import { UploadPurpose } from '../types/file.types';

export class UploadFileQueryDto {
  @ApiProperty({ enum: UploadPurpose })
  purpose!: UploadPurpose;
}
//so swagger show a file picker in UI
export class UploadFileBodyDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: any;
}
