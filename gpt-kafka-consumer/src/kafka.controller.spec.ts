import { Test, TestingModule } from '@nestjs/testing';
import { KafkaController } from './kafka.controller';
import { ConversationService } from './conversation/conversation.service';
import {
  LlmRequestMessage,
  LlmResponseMessage,
  ConversationEntity,
  MessageEntity,
} from '@shoshizan/shared-interfaces';

describe('KafkaController', () => {
  let controller: KafkaController;
  let conversationService: jest.Mocked<ConversationService>;

  beforeEach(async () => {
    const mockConversationService = {
      createConversation: jest.fn(),
      addMessage: jest.fn(),
      getConversation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KafkaController],
      providers: [
        {
          provide: ConversationService,
          useValue: mockConversationService,
        },
      ],
    }).compile();

    controller = module.get<KafkaController>(KafkaController);
    conversationService = module.get(ConversationService);
  });

  describe('handleInputCreated', () => {
    it('should process input message successfully', async () => {
      const mockData: LlmRequestMessage = {
        conversationId: '1',
        prompt: 'Hello',
        system: 'You are helpful',
        options: { temperature: 0.7, num_predict: 100 },
        model: 'gpt-666',
        timestamp: Date.now().toString(),
      };

      const mockConversation: ConversationEntity = {
        id: '1',
        userId: '1',
        user: {
          id: '1',
          email: 'test@test.com',
          name: 'Test User',
          password: '123456',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        systemPrompt: mockData.system!,
        modelOptions: mockData.options,
        messages: [],
        responses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        apiMetrics: {
          total_duration: 0,
          load_duration: 0,
          prompt_eval_duration: 0,
          eval_duration: 0,
          eval_count: 0,
        },
        context: null,
      };

      const mockMessage: MessageEntity = {
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: Date.now().toString(),
        conversation: mockConversation,
        createdAt: new Date(),
      };

      conversationService.createConversation.mockResolvedValue(
        mockConversation,
      );
      conversationService.addMessage.mockResolvedValue(mockMessage);

      const result = await controller.handleInputCreated(mockData);

      expect(result).toEqual({ received: true, message: mockData });
      expect(conversationService.createConversation).toHaveBeenCalledWith(
        mockData.conversationId,
        mockData.system,
        mockData.options,
        mockData.userId,
      );
      expect(conversationService.addMessage).toHaveBeenCalledWith(
        mockData.conversationId,
        mockData.prompt,
        'user',
        mockData.model,
      );
    });

    it('should handle errors when processing input message', async () => {
      const mockData: LlmRequestMessage = {
        conversationId: '1',
        prompt: 'Hello',
        model: 'gpt-666',
        options: { temperature: 0.7, num_predict: 100 },
        timestamp: Date.now().toString(),
      };

      conversationService.createConversation.mockRejectedValue(
        new Error('[TEST SCENARIO] Expected error in input message processing'),
      );

      await expect(controller.handleInputCreated(mockData)).rejects.toThrow(
        '[TEST SCENARIO] Expected error in input message processing',
      );
    });
  });

  describe('handleOutputCreated', () => {
    it('should process output message successfully', async () => {
      const mockData: LlmResponseMessage = {
        conversationId: '1',
        response: 'Hi there',
        model: 'gpt-666',
        timestamp: Date.now().toString(),
      };

      const mockConversation: ConversationEntity = {
        id: '1',
        userId: '1',
        user: {
          id: '1',
          email: 'test@test.com',
          name: 'Test User',
          password: '123456',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        systemPrompt: '',
        modelOptions: { temperature: 0.7, num_predict: 100 },
        messages: [],
        responses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        apiMetrics: {
          total_duration: 0,
          load_duration: 0,
          prompt_eval_duration: 0,
          eval_duration: 0,
          eval_count: 0,
        },
        context: null,
      };

      const mockMessage: MessageEntity = {
        id: '1',
        content: 'Hi there',
        role: 'assistant',
        timestamp: Date.now().toString(),
        conversation: mockConversation,
        createdAt: new Date(),
      };

      conversationService.getConversation.mockResolvedValue(mockConversation);
      conversationService.addMessage.mockResolvedValue(mockMessage);

      const result = await controller.handleOutputCreated(mockData);

      expect(result).toEqual({ received: true, message: mockData });
      expect(conversationService.getConversation).toHaveBeenCalledWith(
        mockData.conversationId,
      );
      expect(conversationService.addMessage).toHaveBeenCalledWith(
        mockData.conversationId,
        mockData.response,
        'assistant',
        mockData.model,
      );
    });

    it('should handle non-existent conversation by creating one', async () => {
      const mockData: LlmResponseMessage = {
        conversationId: '1',
        response: 'This is my response',
        model: 'gpt-666',
        timestamp: Date.now().toString(),
      };

      const mockConversation: ConversationEntity = {
        id: '1',
        userId: '',
        user: {
          id: '1',
          email: 'test@test.com',
          name: 'Test User',
          password: '123456',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        systemPrompt: '',
        modelOptions: { temperature: 0.7, num_predict: 100 },
        messages: [],
        responses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        apiMetrics: {
          total_duration: 0,
          load_duration: 0,
          prompt_eval_duration: 0,
          eval_duration: 0,
          eval_count: 0,
        },
        context: null,
      };

      const mockMessage: MessageEntity = {
        id: '1',
        content: 'This is my response',
        role: 'assistant',
        timestamp: Date.now().toString(),
        conversation: mockConversation,
        createdAt: new Date(),
      };

      conversationService.getConversation.mockResolvedValue(null);
      conversationService.createConversation.mockResolvedValue(
        mockConversation,
      );
      conversationService.addMessage.mockResolvedValue(mockMessage);

      const result = await controller.handleOutputCreated(mockData);

      expect(result).toEqual({ received: true, message: mockData });
      expect(conversationService.createConversation).toHaveBeenCalledWith(
        mockData.conversationId,
        undefined,
        undefined,
        undefined,
      );
      expect(conversationService.addMessage).toHaveBeenCalledWith(
        mockData.conversationId,
        mockData.response,
        'assistant',
        mockData.model,
      );
    });

    it('should handle errors when processing output message', async () => {
      const mockData: LlmResponseMessage = {
        conversationId: '1',
        response: 'Hi there',
        model: 'gpt-666',
        timestamp: Date.now().toString(),
      };

      conversationService.getConversation.mockRejectedValue(
        new Error('Test error'),
      );

      await expect(controller.handleOutputCreated(mockData)).rejects.toThrow(
        'Test error',
      );
    });

    it('should handle errors when creating conversation for AI response', async () => {
      const mockData: LlmResponseMessage = {
        conversationId: '1',
        response: 'This is my response',
        model: 'gpt-666',
        timestamp: Date.now().toString(),
      };

      conversationService.getConversation.mockResolvedValue(null);
      conversationService.createConversation.mockRejectedValue(
        new Error('Failed to create conversation'),
      );

      await expect(controller.handleOutputCreated(mockData)).rejects.toThrow(
        'Failed to create conversation',
      );
      expect(conversationService.createConversation).toHaveBeenCalledWith(
        mockData.conversationId,
        undefined,
        undefined,
        undefined,
      );
    });
  });
});
