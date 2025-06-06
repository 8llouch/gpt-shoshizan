import { Body, Controller, Post } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';
import { LlmRequestMessageDto } from './dto/llm-request-message.dto';
import { LlmRequestMessage } from '@shoshizan/shared-interfaces';

@Controller('ai-inputs')
export class KafkaProducerController {
  constructor(private readonly producerService: KafkaProducerService) {}

  @Post()
  async sendUserInput(@Body() input: LlmRequestMessageDto) {
    const message: LlmRequestMessage = {
      ...input,
      timestamp: new Date().toISOString(),
    };
    return this.producerService.produceMessage('input.created', message);
  }
}
