import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IMAGEKIT } from './imagekit.provider';
import { UploadPurpose } from './types/file.types';
import { UPLOAD_RULES } from './types/file.rules';
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import { env } from 'src/config/env';
import ImageKit from 'imagekit';

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
      // const stream = fsSync.createReadStream(file.path);
      // const uploadedFile = await toFile(stream);

      // const res = await this.imageKit.files.upload({
      //   file: uploadedFile,
      //   fileName: file.originalname,
      //   folder: rule.folder,
      //   useUniqueFileName: true,
      // });

      const buf = await fs.readFile(file.path);

      const res = await this.imageKit.upload({
        file: buf.toString('base64'),

        fileName: file.originalname,
        folder: rule.folder,
        useUniqueFileName: true,
      });

      return {
        fileId: res.fileId,
        url: res.url,
        purpose: purpose,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (err: any) {
      console.log('IMAGEKIT RAW:', err);

      const msg =
        err?.message || err?.error?.message || err?.help || JSON.stringify(err);

      throw new BadRequestException(`ImageKit upload failed: ${msg}`);
    } finally {
      //delete temp file:
      await fs.unlink(file.path).catch(() => {});
    }
  }
  validateFile(file: Express.Multer.File, purpose: UploadPurpose) {
    const rule = UPLOAD_RULES[purpose];
    if (!rule) throw new BadRequestException('Invalid purpose');
    if (!rule.allowedMime.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${rule.allowedMime.join(', ')}`,
      );
    }
    if (file.size > rule.maxBytes) {
      throw new BadRequestException(
        `File too large. Max ${(rule.maxBytes / (1024 * 1024)).toFixed(0)}MB`,
      );
    }
  }
  async deleteFile(fileId) {
    if (!fileId) throw new BadRequestException('fileId is required');
    await this.imageKit.deleteFile(fileId);
    return { deleted: true };
  }
}
