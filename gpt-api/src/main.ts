import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.API_PORT);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'DELETE'],
  });

  const config = new DocumentBuilder()
    .setTitle('Shoshizan GPT API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addTag('API Requests')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
bootstrap();
