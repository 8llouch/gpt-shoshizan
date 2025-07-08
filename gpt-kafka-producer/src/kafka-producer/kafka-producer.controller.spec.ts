import { Test, TestingModule } from '@nestjs/testing';
import { KafkaProducerController } from './kafka-producer.controller';
import { KafkaProducerService } from './kafka-producer.service';
import { LlmRequestMessageDto } from './dto/llm-request-message.dto';
import { JwtPayload } from '@shoshizan/shared-interfaces';
import { KafkaConfigService } from '../kafka-config/kafka-config.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('../common/decorators/retry.decorator', () => ({
  Retry:
    () =>
    (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('KafkaProducerController', () => {
  let controller: KafkaProducerController;

  const mockKafkaConfigService = {
    sendMessage: jest.fn(),
  };

  const mockKafkaProducerService = {
    produceMessage: jest.fn().mockResolvedValue(undefined),
    produceResponseMessage: jest.fn().mockResolvedValue(undefined),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRequest = {
    user: {
      sub: 'user-123',
      email: 'test@example.com',
      iat: 1234567890,
      exp: 1234567890,
    } as JwtPayload,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KafkaProducerController],
      providers: [
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducerService,
        },
        {
          provide: KafkaConfigService,
          useValue: mockKafkaConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<KafkaProducerController>(KafkaProducerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendUserInput', () => {
    it('should call produceMessage with correct topic and message format', async () => {
      const mockInput: LlmRequestMessageDto = {
        model: 'gpt-4',
        prompt: 'test message',
        conversationId: 'conv123',
        options: {
          temperature: 0.7,
          num_predict: 100,
        },
      };

      await controller.sendUserInput(mockInput, mockRequest);

      expect(mockKafkaProducerService.produceMessage).toHaveBeenCalledWith(
        'input.created',
        expect.objectContaining({
          model: mockInput.model,
          prompt: mockInput.prompt,
          conversationId: mockInput.conversationId,
          options: mockInput.options,
          userId: mockRequest.user.sub,
          timestamp: expect.any(String) as string,
        }),
      );
    });
  });

  describe('sendAiResponse', () => {
    it('should call produceResponseMessage with correct topic and message format', async () => {
      const mockOutput = {
        model: 'gpt-4',
        response: 'AI response',
        conversationId: 'conv123',
        timestamp: new Date().toISOString(),
      };

      await controller.sendAiResponse(mockOutput, mockRequest);

      expect(
        mockKafkaProducerService.produceResponseMessage,
      ).toHaveBeenCalledWith(
        'output.created',
        expect.objectContaining({
          model: mockOutput.model,
          response: mockOutput.response,
          conversationId: mockOutput.conversationId,
          timestamp: expect.any(String) as string,
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockInput: LlmRequestMessageDto = {
        model: 'gpt-4',
        prompt: 'test message',
        conversationId: 'conv123',
        options: {
          temperature: 0.7,
          num_predict: 100,
        },
      };

      const error = new Error('Kafka error');
      mockKafkaProducerService.produceMessage.mockRejectedValueOnce(error);

      await expect(
        controller.sendUserInput(mockInput, mockRequest),
      ).rejects.toThrow('Kafka error');
    });
  });
});
