import { Global, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { ImageKitProvider } from './imagekit.provider';
import { FileController } from './file.controller';
import multer from 'multer';
import * as path from 'node:path';
import * as fs from 'node:fs';
const uploadDir = path.resolve(process.cwd(), 'tmp', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

@Global()
@Module({
  imports: [
    MulterModule.register({
      storage: multer.diskStorage({
        destination: uploadDir,

        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),

      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  ],
  controllers: [FileController],
  providers: [FileService, ImageKitProvider],
  exports: [FileService, MulterModule],
})
export class FileModule {}
