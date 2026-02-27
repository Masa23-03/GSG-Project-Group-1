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
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Database error',
      timestamp: new Date().toISOString(),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: req.url,
    };
    console.error('[PrismaException]', exception);
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const code = exception.code;
      switch (code) {
        case 'P2002': {
          errorResponse.statusCode = HttpStatus.CONFLICT;

          const targets = extractTargets(exception);
          if (targets.length) {
            errorResponse.message =
              targets.length === 1
                ? `Duplicate value for: ${targets[0]}`
                : `Duplicate values for: ${targets.join(', ')}`;
            errorResponse.fields = targets.map((t) => ({
              field: t,
              message: 'Already exists',
            }));
          } else {
            errorResponse.message = 'Duplicate value (unique constraint)';
            errorResponse.fields = [
              { field: 'unknown', message: 'Already exists' },
            ];
          }
          break;
        }

        case 'P2003': {
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          const fields = extractTargets(exception);
          errorResponse.message =
            'Invalid reference (foreign key constraint failed)';
          if (fields.length) {
            errorResponse.fields = fields.map((f) => ({
              field: f,
              message: 'Invalid reference',
            }));
          }
          break;
        }

        case 'P2025': {
          errorResponse.statusCode = HttpStatus.NOT_FOUND;
          errorResponse.message = 'Record not found';
          break;
        }

        case 'P2000': {
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = 'Value too long';
          break;
        }

        case 'P2011': {
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = 'Missing required field';
          const fields = extractTargets(exception);
          if (fields.length) {
            errorResponse.fields = fields.map((f) => ({
              field: f,
              message: 'Required',
            }));
          }
          break;
        }

        case 'P2014': {
          errorResponse.statusCode = HttpStatus.CONFLICT;
          errorResponse.message = 'Relation constraint failed';
          break;
        }

        case 'P2024': {
          errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          errorResponse.message = 'Database connection timeout';
          break;
        }

        default: {
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = 'Database request error';
          errorResponse.fields = [
            { field: 'unknown', message: `Prisma code: ${code}` },
          ];
        }
      }
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    if (exception instanceof Prisma.PrismaClientValidationError) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.message = 'Invalid query or invalid input format';
      errorResponse.fields = [{ field: 'query', message: 'Validation failed' }];
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    if (
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientRustPanicError
    ) {
      errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      errorResponse.message = 'Database service unavailable';
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    return res.status(errorResponse.statusCode).json(errorResponse);
  }
}
function extractTargets(e: Prisma.PrismaClientKnownRequestError): string[] {
  const target = e.meta?.target;

  if (typeof target === 'string') return [target];
  if (Array.isArray(target)) return target.map(String);

  const msg = String((e as any).message ?? '');

  const m1 = msg.match(/fields:\s*\(([^)]+)\)/i);
  if (m1) {
    return m1[1]
      .split(',')
      .map((s) => s.trim().replace(/^['"`]+|['"`]+$/g, ''))
      .filter(Boolean);
  }

  return [];
}
