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

@Catch(
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
)
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

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          errorResponse.statusCode = HttpStatus.CONFLICT;
          errorResponse.message = exception.message;
          if (exception.meta && exception.meta.target) {
            if (typeof exception.meta.target === 'string') {
              errorResponse.message = `Unique constraint failed on the field: ${exception.meta.target}`;
              errorResponse.fields = [
                {
                  field: exception.meta.target,
                  message: exception.message,
                },
              ];
            } else if (Array.isArray(exception.meta.target)) {
              const fields = exception.meta.target.join(', ');
              errorResponse.message = `Unique constraint failed on the fields: ${fields}`;
              errorResponse.fields = exception.meta.target.map((field) => ({
                field: String(field),
                message: `Unique constraint failed on: ${String(field)}`,
              }));
            }
          }
          break;
        case 'P2025':
          errorResponse.statusCode = HttpStatus.NOT_FOUND;
          errorResponse.message = 'Record not found';
          break;
        case 'P2003':
          errorResponse.statusCode = HttpStatus.CONFLICT;
          errorResponse.message = 'Invalid relation reference';
          break;
        case 'P2000':
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = 'Value too long for column';
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
          errorResponse.message = exception.message;
      }
    }
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
}
