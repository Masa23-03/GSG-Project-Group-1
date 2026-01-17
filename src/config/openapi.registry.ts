import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import '@asteasolutions/zod-to-openapi/extendZodWithOpenApi';

export const registry = new OpenAPIRegistry();
