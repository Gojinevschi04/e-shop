import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configSwagger = app.get(ConfigService);
  const config = new DocumentBuilder()
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  if (configSwagger.get<boolean>('ENABLE_OPEN_API')) {
    SwaggerModule.setup('api', app, document);
  }
  const port = configSwagger.get<number>('APP_PORT') as number;
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
}

bootstrap();
