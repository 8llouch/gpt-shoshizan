import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConversationEntity,
  MessageEntity,
  UserEntity,
} from '@shoshizan/shared-interfaces';
import { Repository } from 'typeorm';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let conversationRepository: jest.Mocked<Repository<ConversationEntity>>;
  let messageRepository: jest.Mocked<Repository<MessageEntity>>;
  let userRepository: jest.Mocked<Repository<UserEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getRepositoryToken(ConversationEntity),
          useValue: {
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    conversationRepository = module.get(getRepositoryToken(ConversationEntity));
    messageRepository = module.get(getRepositoryToken(MessageEntity));
    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConversationsWithMessages', () => {
    it('should return conversations with messages for a specific user', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const conversations = [
        { id: '1', userId, messages: [{ id: '1', content: 'Hello you !' }] },
        {
          id: '2',
          userId,
          messages: [{ id: '2', content: 'How do you do ?' }],
        },
      ];

      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);
      conversationRepository.find.mockResolvedValue(
        conversations as ConversationEntity[],
      );

      const result = await service.getConversationsWithMessages(userId);

      expect(result).toEqual(conversations);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(conversationRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['messages', 'user'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when user not found', async () => {
      const userId = 'non-existent-user';

      userRepository.findOne.mockResolvedValue(null);

      const result = await service.getConversationsWithMessages(userId);

      expect(result).toEqual([]);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(conversationRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const conversationId = '1';
      const userId = 'user-123';
      const mockConversation = {
        id: conversationId,
        userId: userId,
        messages: [],
        user: null,
        systemPrompt: null,
        responses: [],
        modelOptions: null,
        apiMetrics: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      conversationRepository.findOne.mockResolvedValue(
        mockConversation as unknown as ConversationEntity,
      );
      messageRepository.delete.mockResolvedValue({ affected: 1 } as any);
      conversationRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteConversation(conversationId, userId);

      expect(conversationRepository.findOne).toHaveBeenCalledWith({
        where: { id: conversationId },
      });
      expect(messageRepository.delete).toHaveBeenCalledWith({
        conversation: { id: conversationId },
      });
      expect(conversationRepository.delete).toHaveBeenCalledWith(
        conversationId,
      );
    });
  });
});
