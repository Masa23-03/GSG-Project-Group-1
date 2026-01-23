import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { ApiErrorResponse } from 'src/types/unifiedType.types';

@Catch()
export class UncaughtException extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    console.error('[UnknownError]', exception);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: req.url,
    };
    console.error('[UncaughtException]', exception);

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}
