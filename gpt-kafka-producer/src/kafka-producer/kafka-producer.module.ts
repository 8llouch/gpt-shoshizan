import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { KafkaConfigModule } from '../kafka-config/kafka-config.module';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaProducerController } from './kafka-producer.controller';

@Module({
  imports: [
    KafkaConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [KafkaProducerController],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}
