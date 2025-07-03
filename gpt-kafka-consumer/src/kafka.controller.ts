import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationService } from './conversation/conversation.service';
import {
  LlmRequestMessage,
  LlmResponseMessage,
} from '@shoshizan/shared-interfaces';

@Controller()
export class KafkaController {
  private readonly logger = new Logger(KafkaController.name);

  constructor(private readonly conversationService: ConversationService) {}

  @MessagePattern('input.created')
  async handleInputCreated(@Payload() data: LlmRequestMessage) {
    try {
      let conversation = await this.conversationService.getConversation(
        data.conversationId,
      );

      if (!conversation) {
        this.logger.log(
          `Creating new conversation ${data.conversationId} for first message`,
        );
        conversation = await this.conversationService.createConversation(
          data.conversationId,
          data.system,
          data.options,
          data.userId,
        );
        this.logger.log('Conversation created: ', conversation.id);
      } else {
        this.logger.log(
          'Processing message for existing conversation: ',
          conversation.id,
        );
      }

      const message = await this.conversationService.addMessage(
        data.conversationId,
        data.prompt,
        'user',
        data.model,
      );

      this.logger.log(
        'message added to conversation ',
        conversation.id,
        message,
      );

      return { received: true, message: data };
    } catch (error) {
      this.logger.error(`Error processing message: ${error}`);
      throw error;
    }
  }

  @MessagePattern('output.created')
  async handleOutputCreated(@Payload() data: LlmResponseMessage) {
    try {
      const conversation = await this.conversationService.getConversation(
        data.conversationId,
      );

      if (!conversation) {
        this.logger.warn(
          `Conversation with ID ${data.conversationId} not found`,
        );
        return { received: false, message: data };
      }

      const message = await this.conversationService.addMessage(
        data.conversationId,
        data.response,
        'assistant',
        data.model,
      );

      this.logger.log(
        'AI response added to conversation ',
        conversation.id,
        message,
      );

      if (data.context && Array.isArray(data.context)) {
        await this.conversationService.updateConversationContext(
          data.conversationId,
          data.context,
        );
        this.logger.log(
          'Conversation context updated for conversation ',
          conversation.id,
        );
      }

      return { received: true, message: data };
    } catch (error) {
      this.logger.error(`Error processing output message: ${error}`);
      throw error;
    }
  }
}
