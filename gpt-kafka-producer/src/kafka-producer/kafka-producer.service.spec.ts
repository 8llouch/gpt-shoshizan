import { Test, TestingModule } from '@nestjs/testing';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConfigService } from '../kafka-config/kafka-config.service';
import { LlmRequestMessage } from '@shoshizan/shared-interfaces';

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;

  const mockKafkaConfigService = {
    sendMessage: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaProducerService,
        {
          provide: KafkaConfigService,
          useValue: mockKafkaConfigService,
        },
      ],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('produceMessage', () => {
    it('should call kafkaConfigService.sendMessage with correct parameters', async () => {
      const topic = 'test.topic';
      const message: LlmRequestMessage = {
        model: 'gpt-4',
        prompt: 'test message',
        conversationId: 'conv123',
        options: {
          temperature: 0.7,
          num_predict: 100,
        },
        timestamp: new Date().toISOString(),
      };

      await service.produceMessage(topic, message);

      expect(mockKafkaConfigService.sendMessage).toHaveBeenCalledWith(
        topic,
        message,
        KafkaProducerService.name,
      );
    });

    it('should retry on failure (handled by Retry decorator)', async () => {
      const topic = 'test.topic';
      const message: LlmRequestMessage = {
        model: 'gpt-4',
        prompt: 'test message',
        conversationId: 'conv123',
        options: {
          temperature: 0.7,
          num_predict: 100,
        },
        timestamp: new Date().toISOString(),
      };

      // First two calls fail, third succeeds
      mockKafkaConfigService.sendMessage
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce(undefined);

      await service.produceMessage(topic, message);

      expect(mockKafkaConfigService.sendMessage).toHaveBeenCalledTimes(3);
      expect(mockKafkaConfigService.sendMessage).toHaveBeenLastCalledWith(
        topic,
        message,
        KafkaProducerService.name,
      );
    });
  });
});
