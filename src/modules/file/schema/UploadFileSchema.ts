import z, { ZodType } from 'zod';
import { UploadFileQueryDto } from '../dto/UploadFileDto';
import { UploadPurpose } from '../types/file.types';

export const uploadQuerySchema = z.object({
  purpose: z.nativeEnum(UploadPurpose),
}) satisfies ZodType<UploadFileQueryDto>;
