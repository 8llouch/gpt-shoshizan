import { Module } from '@nestjs/common';
import { ConversationsModule } from './conversations/conversations.module';
import {
  ConversationEntity,
  MessageEntity,
  UserEntity,
} from '@shoshizan/shared-interfaces';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './authentication/authentication.module';
import { MetricsModule } from './metrics/metrics.module';

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
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || true, // false for production
    }),
    ConversationsModule,
    AuthModule,
    MetricsModule,
  ],
})
export class AppModule {
  // TracingMiddleware removed - HTTP auto-instrumentation handles it
}
