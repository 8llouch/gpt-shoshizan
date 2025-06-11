import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationEntity,
  MessageEntity,
  ModelOptions,
} from '@shoshizan/shared-interfaces';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectRepository(ConversationEntity)
    private conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
  ) {}

  /**
   * Fetches all conversations from the database.
   * @returns A promise that resolves to an array of Conversation entities.
   */
  async getConversations(): Promise<ConversationEntity[]> {
    this.logger.log('Fetching all conversations');
    const conversations = await this.conversationRepository.find({
      relations: ['messages'],
    });
    this.logger.log(`Found ${conversations.length} conversations`);
    return conversations;
  }

  async createConversation(
    conversationId: string,
    systemPrompt?: string,
    modelOptions?: ModelOptions,
  ): Promise<ConversationEntity> {
    try {
      this.logger.log(`Creating conversation ${conversationId}`);
      const conversation = this.conversationRepository.create({
        id: conversationId,
        systemPrompt,
        modelOptions,
        responses: [],
      });
      const saved = await this.conversationRepository.save(conversation);
      this.logger.log(`Created conversation ${conversationId}`);
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

  async updateApiMetrics(
    conversationId: string,
    metrics: {
      total_duration?: number;
      load_duration?: number;
      prompt_eval_duration?: number;
      eval_duration?: number;
      eval_count?: number;
    },
  ): Promise<ConversationEntity> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.apiMetrics = metrics;
    return this.conversationRepository.save(conversation);
  }

  async getConversation(
    conversationId: string,
  ): Promise<ConversationEntity | null> {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['messages'],
    });
  }
}
