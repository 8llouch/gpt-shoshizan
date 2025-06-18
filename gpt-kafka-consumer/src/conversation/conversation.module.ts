import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversationEntity,
  MessageEntity,
  UserEntity,
} from '@shoshizan/shared-interfaces';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity, UserEntity]),
  ],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
