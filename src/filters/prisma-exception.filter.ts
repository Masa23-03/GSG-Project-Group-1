import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ApiErrorResponse } from 'src/types/unifiedType.types';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Invalid data or operation. Please check your input',
      timestamp: new Date().toISOString(),
      statusCode: HttpStatus.BAD_REQUEST,
      path: req.url,
    };
    console.error('[PrismaException]', exception);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          errorResponse.statusCode = HttpStatus.CONFLICT;
          const target = exception.meta?.target;
          if (typeof target === 'string') {
            errorResponse.message = `Duplicate value for: ${target}`;
            errorResponse.fields = [
              { field: target, message: 'Already exists' },
            ];
          } else if (Array.isArray(target)) {
            errorResponse.message = `Duplicate values for: ${target.join(', ')}`;
            errorResponse.fields = target.map((f) => ({
              field: String(f),
              message: 'Already exists',
            }));
          } else {
            errorResponse.message = 'Unique constraint failed';
          }
          break;

        case 'P2025':
          errorResponse.statusCode = HttpStatus.NOT_FOUND;
          errorResponse.message = 'Record not found';
          break;
        case 'P2003':
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message =
            'Invalid reference (relation constraint failed)';
          break;
        case 'P2000':
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = 'Value too long';
          break;

        case 'P2014':
          errorResponse.statusCode = HttpStatus.CONFLICT;
          errorResponse.message = 'Relation constraint failed';
          break;
        case 'P2024':
          errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          errorResponse.message = 'Database connection timeout';
          break;
        default:
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = 'Database request error';
      }
    }
    console.error('[UncaughtException]', exception);

    return res.status(errorResponse.statusCode).json(errorResponse);
  }
}
