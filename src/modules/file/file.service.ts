import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IMAGEKIT } from './imagekit.provider';
import ImageKit, { toFile } from '@imagekit/nodejs';
import { UploadPurpose } from './types/file.types';
import { UPLOAD_RULES } from './types/file.rules';
import * as fs from 'node:fs/promises';
import { UploadFileResponseDto } from './dto/UploadFileResponseDto';

@Injectable()
export class FileService {
  constructor(@Inject(IMAGEKIT) private readonly imageKit: ImageKit) {}

  async uploadSingle(file: Express.Multer.File, purpose: UploadPurpose) {
    if (!file) throw new BadRequestException('File is required');

    this.validateFile(file, purpose);
    const rule = UPLOAD_RULES[purpose];
    if (!file.path)
      throw new BadRequestException(
        `File path missing (diskStorage not configured)`,
      );
    try {
      const fileBuffer = await fs.readFile(file.path);
      const res = await this.imageKit.files.upload({
        file: fileBuffer,
        fileName: file.originalname,
        folder: rule.folder,
        useUniqueFileName: true,
      });
      return {
        fileId: res.fileId,
        url: res.url,
        purpose: purpose,
        mimetype: file.mimetype,
        size: file.size,
      };
    } finally {
      //delete temp file:
      await fs.unlink(file.path).catch(() => {});
    }
  }
  validateFile(file: Express.Multer.File, purpose: UploadPurpose) {}
  deleteFile(fileId) {}
}
