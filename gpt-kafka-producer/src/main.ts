import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: [process.env.FRONT_END_URL],
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  // Start HTTP server
  await app.listen(Number(process.env.PRODUCER_PORT));
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
