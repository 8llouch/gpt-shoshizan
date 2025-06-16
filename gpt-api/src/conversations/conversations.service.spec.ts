import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConversationEntity,
  MessageEntity,
} from '@shoshizan/shared-interfaces';
import { Repository } from 'typeorm';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let conversationRepository: jest.Mocked<Repository<ConversationEntity>>;
  let messageRepository: jest.Mocked<Repository<MessageEntity>>;

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
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    conversationRepository = module.get(getRepositoryToken(ConversationEntity));
    messageRepository = module.get(getRepositoryToken(MessageEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConversationsWithMessages', () => {
    it('should return all conversations with messages', async () => {
      const conversations = [
        { id: '1', messages: [{ id: '1', content: 'Hello you !' }] },
        { id: '2', messages: [{ id: '2', content: 'How do you do ?' }] },
      ];
      conversationRepository.find.mockResolvedValue(
        conversations as ConversationEntity[],
      );

      const result = await service.getConversationsWithMessages();

      expect(result).toEqual(conversations);
      expect(conversationRepository.find).toHaveBeenCalledWith({
        relations: ['messages'],
      });
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const conversationId = '1';
      await service.deleteConversation(conversationId);
      expect(conversationRepository.delete).toHaveBeenCalledWith(
        conversationId,
      );
      expect(messageRepository.delete).toHaveBeenCalledWith({
        conversation: { id: conversationId },
      });
    });
  });
});
