import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // prefix api
  app.setGlobalPrefix('api');

  // auto versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // validation
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

        // shape of bad request exception
        return new BadRequestException({ ...formatted });
      },
    }),
  );

  // custom execption error filter global
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
