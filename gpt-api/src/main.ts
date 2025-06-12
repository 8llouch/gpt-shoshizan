import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const host = process.env.HOST || '0.0.0.0';

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST'],
  });

  await app.listen(port, host);
}
bootstrap();
