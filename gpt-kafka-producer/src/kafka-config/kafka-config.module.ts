import { Module } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaConfigService } from './kafka-config.service';

@Module({
  providers: [
    {
      provide: 'KAFKA_CLIENT',
      useFactory: () =>
        new Kafka({
          clientId: 'gpt-kafka-producer',
          brokers: [process.env.KAFKA_BROKER!],
        }),
    },
    KafkaConfigService,
  ],
  exports: [KafkaConfigService],
})
export class KafkaConfigModule {}
