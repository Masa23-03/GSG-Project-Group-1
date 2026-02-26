import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UploadPurpose } from './types/file.types';
import { UPLOAD_RULES } from './types/file.rules';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { CLOUDINARY } from './cloudinary.provider';
import type { v2 as CloudinaryV2 } from 'cloudinary';

@Injectable()
export class FileService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof CloudinaryV2,
  ) {}

  async uploadSingle(file: Express.Multer.File, purpose: UploadPurpose) {
    if (!file) throw new BadRequestException('File is required');

    this.validateFile(file, purpose);

    const rule = UPLOAD_RULES[purpose];
    if (!file.path) {
      throw new BadRequestException(
        'File path missing (diskStorage not configured)',
      );
    }

    const folder = rule.folder.replace(/^\//, '');
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isPdf =
      file.mimetype === 'application/pdf' ||
      ext === '.pdf' ||
      file.mimetype === 'application/octet-stream'; // common with some clients

    try {
      const res = await this.cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: isPdf ? 'raw' : 'image',
        access_mode: 'public',
        use_filename: true,
        unique_filename: true,
      });

      // TEMP DEBUG (remove later)
      // console.log('UPLOAD mimetype:', file.mimetype);
      // console.log('UPLOAD originalname:', file.originalname);
      // console.log('CLOUDINARY resource_type:', res.resource_type);
      // console.log('CLOUDINARY secure_url:', res.secure_url);

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

    // If you want to be strict: keep this as-is.
    // If Swagger sometimes sends octet-stream for PDFs, consider allowing it ONLY for PRESCRIPTION_FILE.
    const allowed = rule.allowedMime.includes(file.mimetype as any);
    const ext = path.extname(file.originalname || '').toLowerCase();

    const swaggerPdfEdgeCase =
      purpose === UploadPurpose.PRESCRIPTION_FILE &&
      ext === '.pdf' &&
      file.mimetype === 'application/octet-stream';

    if (!allowed && !swaggerPdfEdgeCase) {
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

    const tryDestroy = async (resource_type: 'image' | 'raw' | 'video') =>
      this.cloudinary.uploader.destroy(fileId, { resource_type });

    const r1 = await tryDestroy('image');
    if (r1?.result === 'ok') return { deleted: true };

    const r2 = await tryDestroy('raw');
    if (r2?.result === 'ok') return { deleted: true };

    return { deleted: false };
  }
}
