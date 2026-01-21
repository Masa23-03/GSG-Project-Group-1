import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { env } from 'src/config/env';
import { ApiErrorResponse } from 'src/types/unifiedType.types';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Validation failed',
      timestamp: new Date().toISOString(),
      statusCode: status,
      path: req.url,
      fields: exception.issues.map((issue) => ({
        field: issue.path.length ? issue.path.join('.') : 'body',
        message:
          env.NODE_ENV === 'development' ? issue.message : 'Invalid value',
      })),
    };
    res.status(status).json(errorResponse);
    console.error('[UncaughtException]', exception);
  }
}
