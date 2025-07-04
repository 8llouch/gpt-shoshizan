import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: [process.env.FRONT_END_URL || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("GPT-SHOSHIZAN Gateway API")
    .setDescription("Gateway service for centralized routing and authentication")
    .setVersion("1.0")
    .addTag("Authentication")
    .addTag("Gateway")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Start HTTP server
  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`Gateway service is running on port ${port}`);
}
bootstrap();
