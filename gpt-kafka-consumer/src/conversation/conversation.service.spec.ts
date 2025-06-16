import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConversationEntity,
  MessageEntity,
} from '@shoshizan/shared-interfaces';
import { Repository } from 'typeorm';

describe('ConversationsService', () => {
  let service: ConversationService;
  let conversationRepository: jest.Mocked<Repository<ConversationEntity>>;
  let messageRepository: jest.Mocked<Repository<MessageEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: getRepositoryToken(ConversationEntity),
          useValue: {
            find: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: {
            delete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    conversationRepository = module.get(getRepositoryToken(ConversationEntity));
    messageRepository = module.get(getRepositoryToken(MessageEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a conversation', async () => {
      const conversationId = '1';
      const mockConversation = { id: conversationId };
      conversationRepository.create.mockReturnValue(
        mockConversation as ConversationEntity,
      );
      conversationRepository.save.mockResolvedValue(
        mockConversation as ConversationEntity,
      );
      const conversation = await service.createConversation(conversationId);
      expect(conversation).toBeDefined();
      expect(conversationRepository.create).toHaveBeenCalled();
      expect(conversationRepository.save).toHaveBeenCalled();
    });
    it('should throw an error if the conversation is not created', async () => {
      const conversationId = '1';
      conversationRepository.create.mockReturnValue(
        null as unknown as ConversationEntity,
      );
      conversationRepository.save.mockResolvedValue(
        null as unknown as ConversationEntity,
      );
      await expect(service.createConversation(conversationId)).rejects.toThrow(
        'Conversation not created',
      );
      expect(conversationRepository.create).toHaveBeenCalledWith({
        id: conversationId,
        systemPrompt: undefined,
        modelOptions: undefined,
        responses: [],
      });
      expect(conversationRepository.save).toHaveBeenCalled();
    });
  });

  describe('addMessage', () => {
    it('should add a message to a conversation', async () => {
      const conversationId = '1';
      const mockConversation = { id: conversationId };
      const mockMessage = { id: '1', content: 'Hello', role: 'user' };
      conversationRepository.findOne.mockResolvedValue(
        mockConversation as ConversationEntity,
      );
      messageRepository.create.mockReturnValue(mockMessage as MessageEntity);
      messageRepository.save.mockResolvedValue(mockMessage as MessageEntity);
      const message = await service.addMessage(conversationId, 'Hello', 'user');
      expect(message).toBeDefined();
      expect(messageRepository.create).toHaveBeenCalled();
      expect(messageRepository.save).toHaveBeenCalled();
    });
    it('should throw an error if the conversation is not found', async () => {
      const conversationId = '1';
      conversationRepository.findOne.mockResolvedValue(null);
      await expect(
        service.addMessage(conversationId, 'Hello', 'user'),
      ).rejects.toThrow(`Conversation ${conversationId} not found`);
    });
  });

  describe('getConversation', () => {
    it('should get a conversation', async () => {
      const conversationId = '1';
      const mockConversation = { id: conversationId };
      conversationRepository.findOne.mockResolvedValue(
        mockConversation as ConversationEntity,
      );
      const conversation = await service.getConversation(conversationId);
      expect(conversation).toBeDefined();
      expect(conversationRepository.findOne).toHaveBeenCalled();
    });
  });
});
