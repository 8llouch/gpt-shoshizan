import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';
import { LlmRequestMessageDto } from './dto/llm-request-message.dto';
import { LlmResponseMessageDto } from './dto/llm-response-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-authentication.guard';
import {
  JwtPayload,
  LlmRequestMessage,
  LlmResponseMessage,
} from '@shoshizan/shared-interfaces';

@Controller('message-producer')
export class KafkaProducerController {
  private readonly logger = new Logger(KafkaProducerController.name);

  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ai-inputs')
  async sendUserInput(
    @Body() llmRequestMessageDto: LlmRequestMessageDto,
    @Request() req: { user: JwtPayload },
  ) {
    const userId = req.user.sub;
    this.logger.log(`Sending user input to Kafka for user ${userId}`);

    const message: LlmRequestMessage = {
      userId,
      conversationId: llmRequestMessageDto.conversationId,
      model: llmRequestMessageDto.model,
      prompt: llmRequestMessageDto.prompt,
      stream: llmRequestMessageDto.stream,
      images: llmRequestMessageDto.images,
      system: llmRequestMessageDto.system,
      options: llmRequestMessageDto.options || { num_predict: 100 },
      timestamp: new Date().toISOString(),
    };

    await this.kafkaProducerService.produceMessage('input.created', message);

    return {
      status: 'success',
      message: 'User input sent to Kafka successfully',
      conversationId: llmRequestMessageDto.conversationId,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('ai-outputs')
  async sendAiResponse(
    @Body() llmResponseMessageDto: LlmResponseMessageDto,
    @Request() req: { user: JwtPayload },
  ) {
    const userId = req.user.sub;
    this.logger.log(`Sending AI response to Kafka for user ${userId}`);

    const message: LlmResponseMessage = {
      conversationId: llmResponseMessageDto.conversationId,
      model: llmResponseMessageDto.model,
      response: llmResponseMessageDto.response,
      timestamp: llmResponseMessageDto.timestamp || new Date().toISOString(),
      context: llmResponseMessageDto.context,
    };

    await this.kafkaProducerService.produceResponseMessage(
      'output.created',
      message,
    );

    return {
      status: 'success',
      message: 'AI response sent to Kafka successfully',
      conversationId: llmResponseMessageDto.conversationId,
    };
  }
}
