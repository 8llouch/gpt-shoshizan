import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationEntity, JwtPayload } from '@shoshizan/shared-interfaces';
import { JwtAuthGuard } from '../authentication/guards/jwt-authentication.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() req: { user: JwtPayload },
  ): Promise<ConversationEntity[]> {
    try {
      return await this.conversationsService.getConversationsWithMessages(
        req.user.sub,
      );
    } catch {
      throw new HttpException(
        'Failed to fetch conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<void> {
    try {
      return await this.conversationsService.deleteConversation(
        id,
        req.user.sub,
      );
    } catch {
      throw new HttpException(
        'Failed to delete conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
