import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MulterError } from 'multer';
import { ApiErrorResponse } from 'src/types/unifiedType.types';
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let message = `Upload error: ${exception.code}`;

    if (exception.code === 'LIMIT_FILE_SIZE') message = 'File too large';
    if (exception.code === 'LIMIT_UNEXPECTED_FILE')
      message = 'Unexpected file field name (expected "file")';

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,

      timestamp: new Date().toISOString(),
      statusCode: HttpStatus.BAD_REQUEST,
      path: request.url,
    };
    console.error('[MulterException]', exception);
    return response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
  }
}
