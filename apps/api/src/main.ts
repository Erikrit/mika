import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function resolveCorsOrigins(): string | string[] {
  const fromList = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (fromList?.length) {
    return fromList.length === 1 ? fromList[0] : fromList;
  }

  const origins = new Set<string>();
  origins.add(process.env.WEB_URL ?? 'http://localhost:3000');

  process.env.CORS_EXTRA_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach((origin) => origins.add(origin));

  const list = [...origins];
  return list.length === 1 ? list[0] : list;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
  });
  app.setGlobalPrefix('');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mika API v1')
    .setDescription('API REST do Mika — assistente pessoal inteligente')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  app.get(Logger).log(`🚀 API running on http://localhost:${port}`, 'Bootstrap');
  app.get(Logger).log(`📚 Swagger docs at http://localhost:${port}/docs`, 'Bootstrap');
}

bootstrap();
