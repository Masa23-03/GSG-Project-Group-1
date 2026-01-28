import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { UncaughtException } from './filters/global-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ZodExceptionFilter } from './filters/zod-exception.filter';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { ImageKitException } from './filters/image-kit-exception.filter';

BigInt.prototype.toJSON = function () {
  return this.toString();
};
async function bootstrap() {
  console.log('DATABASE_URL=', env['DATABASE_URL']);
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(
    new ZodExceptionFilter(),
    new PrismaExceptionFilter(),
    new HttpExceptionFilter(),
    //new UncaughtException(),
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

  const doc = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, doc, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);
}
bootstrap();
