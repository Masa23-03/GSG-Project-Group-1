import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ResponseInterceptor } from './interceptors/response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ZodExceptionFilter } from './filters/zod-exception.filter';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { MulterExceptionFilter } from './filters/file-upload.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  app.useGlobalFilters(
    new ZodExceptionFilter(),
    new PrismaExceptionFilter(),
    new MulterExceptionFilter(),
    new HttpExceptionFilter(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pharmacy Delivery API')
    .setDescription('Backend API documentation')
    .setVersion('1.0')

    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  document.security = [{ 'access-token': [] }];

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Server running on http://localhost:${port}/api`);
  console.log(`Swagger at http://localhost:${port}/docs`);
}

bootstrap();
