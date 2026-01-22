import { Global, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { ImageKitProvider } from './imagekit.provider';
import { FileController } from './file.controller';
import multer from 'multer';
@Global()
@Module({
  imports: [
    MulterModule.register({
      storage: multer.diskStorage({
        destination: './tmp/uploads',

        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),

      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  ],
  controllers: [FileController],
  providers: [FileService, ImageKitProvider],
  exports: [FileService],
})
export class FileModule {}
