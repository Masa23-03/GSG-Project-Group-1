import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export function ApiPaginatedOkResponse<TModel extends Type<any>>(
  model: TModel,
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 10 },
              limit: { type: 'number', example: 10 },
              page: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 },
            },
          },
        },
      },
    }),
  );
}
export function ApiSuccessOkResponse<TModel extends Type<any>>(
  model: TModel,
  opts?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: opts?.description,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}
export function ApiSuccessCreatedResponse<TModel extends Type<any>>(
  model: TModel,
  opts?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      description: opts?.description,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}
