import { Module } from '@nestjs/common';
import { KafkaConfigModule } from '../kafka-config/kafka-config.module';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaProducerController } from './kafka-producer.controller';

@Module({
  imports: [KafkaConfigModule],
  controllers: [KafkaProducerController],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}
