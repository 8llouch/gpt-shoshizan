import { Injectable } from '@nestjs/common';
import { KafkaConfigService } from '../kafka-config/kafka-config.service';
import { Retry } from 'src/common/decorators/retry.decorator';
import { LlmRequestMessage } from '@shoshizan/shared-interfaces';

@Injectable()
export class KafkaProducerService {
  constructor(private readonly kafkaConfigService: KafkaConfigService) {}

  @Retry(3, 1000)
  async produceMessage(
    topic: string,
    message: LlmRequestMessage,
  ): Promise<void> {
    await this.kafkaConfigService.sendMessage(
      topic,
      message,
      KafkaProducerService.name,
    );
  }
}
