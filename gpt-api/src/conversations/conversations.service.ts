import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationEntity,
  MessageEntity,
  UserEntity,
} from '@shoshizan/shared-interfaces';
import { v4 } from 'uuid';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(ConversationEntity)
    private conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  generateConversationId(): string {
    return v4();
  }

  async getConversationsWithMessages(
    userId: string,
  ): Promise<ConversationEntity[]> {
    this.logger.log(`Fetching conversations with messages for user ${userId}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User ${userId} not found`);
      return [];
    }

    const conversations = await this.conversationRepository.find({
      where: { userId },
      relations: ['messages', 'user'],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(
      `Found ${conversations.length} conversations for user ${userId}`,
    );
    return conversations;
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    this.logger.log(`Deleting conversation ${id} and its messages`);

    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });
    if (!conversation) {
      this.logger.warn(`Conversation ${id} not found`);
      throw new Error('Conversation not found');
    }
    if (conversation.userId !== userId) {
      this.logger.warn(
        `User ${userId} is not authorized to delete conversation ${id}`,
      );
      throw new Error('Unauthorized');
    }
    await this.messageRepository.delete({ conversation: { id } });
    this.logger.log(`Deleted messages for conversation ${id}`);

    await this.conversationRepository.delete(id);
    this.logger.log(`Deleted conversation ${id}`);
  }
}
