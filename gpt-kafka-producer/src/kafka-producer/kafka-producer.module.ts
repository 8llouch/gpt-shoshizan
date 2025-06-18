import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { KafkaConfigModule } from '../kafka-config/kafka-config.module';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaProducerController } from './kafka-producer.controller';
import { JwtStrategy } from '../common/strategies/jwt.strategy';

@Module({
  imports: [
    KafkaConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [KafkaProducerController],
  providers: [KafkaProducerService, JwtStrategy],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}
