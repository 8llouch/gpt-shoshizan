import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.API_PORT);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'DELETE'],
  });

  console.log('API_PORT from process.env:', process.env.API_PORT);

  await app.listen(port);
}
bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
