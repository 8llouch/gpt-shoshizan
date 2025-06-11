import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          requestTimeout: 30000,
          connectionTimeout: 10000,
        },
        consumer: {
          groupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'my-consumer-group',
          sessionTimeout: 30000,
          heartbeatInterval: 3000,
        },
      },
    },
  );
  await app.listen();
}
bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
