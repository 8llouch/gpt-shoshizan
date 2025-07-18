import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversationEntity,
  MessageEntity,
  UserEntity,
} from '@shoshizan/shared-interfaces';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [ConversationEntity, MessageEntity, UserEntity],
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || true, // only for dev purposes
    }),
    ConversationModule,
    MessageModule,
  ],
  controllers: [KafkaController],
})
export class AppModule {}
