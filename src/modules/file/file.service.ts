import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UploadPurpose } from './types/file.types';
import { UPLOAD_RULES } from './types/file.rules';
import * as fs from 'node:fs/promises';
import { CLOUDINARY } from './cloudinary.provider';
import type { v2 as CloudinaryV2 } from 'cloudinary';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';

@Injectable()
export class FileService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof CloudinaryV2,
  ) {}

  async uploadSingle(file: Express.Multer.File, purpose: UploadPurpose) {
    if (!file) throw new BadRequestException('File is required');

    this.validateFile(file, purpose);

    const rule = UPLOAD_RULES[purpose];
    if (!file.path)
      throw new BadRequestException(
        `File path missing (diskStorage not configured)`,
      );
    const folder = rule.folder.replace(/^\//, '');
    const isPdf = file.mimetype === 'application/pdf';

    try {
      const res = await this.cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: isPdf ? 'raw' : 'image',
        use_filename: true,
        unique_filename: true,
      });
      return {
        fileId: res.public_id,
        url: res.secure_url,
        purpose,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err);
      throw new BadRequestException(`Cloudinary upload failed: ${msg}`);
    } finally {
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

  async deleteFile(fileId: string) {
    if (!fileId) throw new BadRequestException('fileId is required');

    const tryDestroy = async (resource_type: 'image' | 'raw' | 'video') => {
      return this.cloudinary.uploader.destroy(fileId, { resource_type });
    };

    const r1 = await tryDestroy('image');
    if (r1?.result === 'ok') return { deleted: true };

    const r2 = await tryDestroy('raw');
    if (r2?.result === 'ok') return { deleted: true };

    return { deleted: false };
  }
}
