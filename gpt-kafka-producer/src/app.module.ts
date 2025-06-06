import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaConfigModule } from './kafka-config/kafka-config.module';
import { KafkaProducerModule } from './kafka-producer/kafka-producer.module';

@Module({
  imports: [KafkaConfigModule, KafkaProducerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
