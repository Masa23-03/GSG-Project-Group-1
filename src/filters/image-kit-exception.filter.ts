import { APIError } from '@imagekit/nodejs';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from 'src/types/unifiedType.types';
@Catch(APIError)
export class ImageKitException implements ExceptionFilter {
  catch(exception: APIError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      typeof exception.status === 'number' && exception.status >= 400
        ? exception.status
        : HttpStatus.BAD_GATEWAY;
    const errorResponse: ApiErrorResponse = {
      success: false,
      message:
        'We couldn’t handle your image upload right now. Please try again later',
      timestamp: new Date().toISOString(),
      statusCode: HttpStatus.BAD_REQUEST,
      path: request.url,
    };

    return response.status(status).json(errorResponse);
    console.error('[UncaughtException]', exception);
  }
}
