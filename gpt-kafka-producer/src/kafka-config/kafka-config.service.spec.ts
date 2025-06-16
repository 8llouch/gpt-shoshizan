import { Test, TestingModule } from '@nestjs/testing';
import { KafkaConfigService } from './kafka-config.service';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

describe('KafkaConfigService', () => {
  let service: KafkaConfigService;
  let mockProducer: jest.Mocked<Producer>;
  let mockKafka: jest.Mocked<Kafka>;

  beforeEach(async () => {
    mockProducer = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest
        .fn()
        .mockResolvedValue([
          { topicName: 'test-topic', partition: 0, errorCode: 0 },
        ]),
      disconnect: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Producer>;

    mockKafka = {
      producer: jest.fn().mockReturnValue(mockProducer),
    } as unknown as jest.Mocked<Kafka>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaConfigService,
        {
          provide: 'KAFKA_CLIENT',
          useValue: mockKafka,
        },
      ],
    }).compile();

    service = module.get<KafkaConfigService>(KafkaConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to Kafka successfully', async () => {
      await service.onModuleInit();
      expect(mockProducer.connect).toHaveBeenCalled();
    });

    it('should throw error when connection fails', async () => {
      mockProducer.connect.mockRejectedValueOnce(
        new Error('Connection failed'),
      );
      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('sendMessage', () => {
    const testTopic = 'test-topic';
    const testMessage = { key: 'value' };
    const testContext = 'test-context';

    it('should send message successfully', async () => {
      const result = await service.sendMessage(
        testTopic,
        testMessage,
        testContext,
      );

      const expectedMessage: ProducerRecord = {
        topic: testTopic,
        messages: [{ value: JSON.stringify(testMessage) }],
      };

      expect(mockProducer.send).toHaveBeenCalledWith(expectedMessage);
      expect(result).toBeDefined();
    });

    it('should throw error when sending message fails', async () => {
      mockProducer.send.mockRejectedValueOnce(new Error('Send failed'));

      await expect(
        service.sendMessage(testTopic, testMessage, testContext),
      ).rejects.toThrow('Send failed');
    });
  });
});
