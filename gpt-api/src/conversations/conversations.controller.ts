import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationEntity } from '@shoshizan/shared-interfaces';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async findAll(): Promise<ConversationEntity[]> {
    try {
      return await this.conversationsService.getConversationsWithMessages();
    } catch {
      throw new HttpException(
        'Failed to fetch conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    try {
      return await this.conversationsService.deleteConversation(id);
    } catch {
      throw new HttpException(
        'Failed to delete conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
