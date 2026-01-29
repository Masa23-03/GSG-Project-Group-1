import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from 'src/types/unifiedType.types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('>>> HttpExceptionFilter HIT');

    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status = exception.getStatus();
    const resp = exception.getResponse() as any;

    const message =
      typeof resp === 'string'
        ? resp
        : Array.isArray(resp?.message)
          ? resp.message.join(', ')
          : resp?.message || exception.message;
    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: status,
      path: request.url,
    };
    console.error('[UncaughtException]', exception);

    response.status(status).json(errorResponse);
  }
}
