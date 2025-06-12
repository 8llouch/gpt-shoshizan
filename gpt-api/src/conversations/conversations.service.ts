import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationEntity,
  MessageEntity,
} from '@shoshizan/shared-interfaces';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(ConversationEntity)
    private conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
  ) {}

  async getConversationsWithMessages(): Promise<ConversationEntity[]> {
    this.logger.log('Fetching all conversations with messages');
    const conversations = await this.conversationRepository.find({
      relations: ['messages'],
    });
    return conversations;
  }

  async deleteConversation(id: string): Promise<void> {
    this.logger.log(`Deleting conversation ${id} and its messages`);

    await this.messageRepository.delete({ conversation: { id } });
    this.logger.log(`Deleted messages for conversation ${id}`);

    await this.conversationRepository.delete(id);
    this.logger.log(`Deleted conversation ${id}`);
  }
}
