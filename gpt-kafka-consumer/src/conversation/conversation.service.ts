import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationEntity,
  MessageEntity,
  ModelOptions,
  UserEntity,
} from '@shoshizan/shared-interfaces';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectRepository(ConversationEntity)
    private conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createConversation(
    conversationId: string,
    systemPrompt?: string,
    modelOptions?: ModelOptions,
    userId?: string,
  ): Promise<ConversationEntity> {
    try {
      this.logger.log(
        `Creating conversation ${conversationId} for user ${userId || 'anonymous'}`,
      );

      if (userId) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (!user) {
          this.logger.warn(
            `User ${userId} not found, creating conversation without user association`,
          );
          userId = undefined;
        }
      }

      const conversation = this.conversationRepository.create({
        id: conversationId,
        userId,
        systemPrompt,
        modelOptions,
        responses: [],
      });
      const saved = await this.conversationRepository.save(conversation);
      this.logger.log(`Created conversation ${conversationId}`);
      if (!saved) {
        throw new Error('Conversation not created');
      }
      return saved;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Erreur lors de la création de la conversation : ${errorMessage}`,
      );

      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          `Erreur lors de la création de la conversation : ${errorMessage}`,
        );
      }
    }
  }

  async addMessage(
    conversationId: string,
    content: string,
    role: 'system' | 'user' | 'assistant',
    modelName?: string,
    imageUrl?: string,
  ): Promise<MessageEntity> {
    this.logger.log(`Adding message to conversation ${conversationId}`);
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      this.logger.error(`Conversation ${conversationId} not found`);
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message = this.messageRepository.create({
      content,
      role,
      modelName,
      imageUrl,
      timestamp: Date.now().toString(),
      conversation,
    });

    const saved = await this.messageRepository.save(message);
    this.logger.log(`Added message to conversation ${conversationId}`);
    return saved;
  }

  async getConversation(
    conversationId: string,
  ): Promise<ConversationEntity | null> {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['messages', 'user'],
    });
  }
}
