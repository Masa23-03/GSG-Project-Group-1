import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

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
