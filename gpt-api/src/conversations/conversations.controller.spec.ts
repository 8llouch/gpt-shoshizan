import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationEntity } from '@shoshizan/shared-interfaces';

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let service: jest.Mocked<ConversationsService>;

  beforeEach(async () => {
    const mockService = {
      getConversationsWithMessages: jest.fn(),
      deleteConversation: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    service = module.get(ConversationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all conversations with messages', async () => {
      const userId = 'user-123';
      const mockReq = {
        user: {
          sub: userId,
          email: 'test@example.com',
          role: 'user',
          iat: 1234567890,
          exp: 1234567890,
        },
      };

      const conversations = [
        {
          id: '1',
          userId,
          messages: [
            { id: '1', content: 'Hello you !' },
            { id: '2', content: 'How do you do ?' },
          ],
        },
      ];
      service.getConversationsWithMessages.mockResolvedValue(
        conversations as ConversationEntity[],
      );
      const result = await controller.findAll(mockReq);
      expect(result).toEqual(conversations);
      expect(service.getConversationsWithMessages).toHaveBeenCalledWith(userId);
    });
    it('should handle errors when fetching conversations', async () => {
      const userId = 'user-123';
      const mockReq = {
        user: {
          sub: userId,
          email: 'test@example.com',
          role: 'user',
          iat: 1234567890,
          exp: 1234567890,
        },
      };

      service.getConversationsWithMessages.mockRejectedValue(
        new Error('Test error'),
      );
      await expect(controller.findAll(mockReq)).rejects.toThrow(
        'Failed to fetch conversations',
      );
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const conversationId = '1';
      await controller.delete(conversationId);
      expect(service.deleteConversation).toHaveBeenCalledWith(conversationId);
    });
    it('should handle errors when deleting a conversation', async () => {
      service.deleteConversation.mockRejectedValue(new Error('Test error'));
      await expect(controller.delete('1')).rejects.toThrow(
        'Failed to delete conversation',
      );
    });
  });
});
