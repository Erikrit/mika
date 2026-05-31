import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  app.setGlobalPrefix('');

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  app.get(Logger).log(`🚀 API running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
