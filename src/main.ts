import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { HttpExceptionFilter } from '../common/filter/http-exception.filter';
import { AppModule } from './app.module';
import { winstonConfig } from './logger/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[] = []) => {
        const formatted: Record<string, string> = {};
        errors.forEach((err) => {
          if (err.constraints) {
            formatted[err.property] = Object.values(err.constraints)[0];
          }
        });
        return new BadRequestException({ ...formatted });
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BE Authenticator API')
    .setDescription('Two-Factor Authentication service for external applications')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-client-id' }, 'x-client-id')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-client-secret' }, 'x-client-secret')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
