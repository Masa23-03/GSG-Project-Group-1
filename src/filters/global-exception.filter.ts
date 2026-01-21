import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from 'src/types/unifiedType.types';

@Catch()
export class UncaughtException implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: req.url,
    };

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    console.error('[UncaughtException]', exception);
  }
}
