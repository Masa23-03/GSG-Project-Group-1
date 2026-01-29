import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadPurpose } from './types/file.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { uploadQuerySchema } from './schema/UploadFileSchema';
import { UploadFileBodyDto } from './dto/UploadFileDto';
import { IsPublic } from 'src/decorators/isPublic.decorator';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileBodyDto })
  @ApiQuery({ name: 'purpose', enum: UploadPurpose, required: true })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Query(new ZodValidationPipe(uploadQuerySchema))
    query: { purpose: UploadPurpose },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.fileService.uploadSingle(file, query.purpose);
  }
}
