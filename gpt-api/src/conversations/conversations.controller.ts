import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationEntity, JwtPayload } from '@shoshizan/shared-interfaces';
import { JwtAuthGuard } from '../authentication/guards/jwt-authentication.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiExcludeController,
} from '@nestjs/swagger';

@ApiExcludeController()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @ApiOperation({ summary: 'Generate a new conversation ID' })
  @ApiResponse({
    status: 201,
    description: 'Conversation ID generated successfully',
  })
  @UseGuards(JwtAuthGuard)
  @Post('generate-id')
  generateConversationId(): { conversationId: string } {
    try {
      const conversationId = this.conversationsService.generateConversationId();
      return { conversationId };
    } catch {
      throw new HttpException(
        'Failed to generate conversation ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get all conversations for the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of conversations with messages',
  })
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

  @ApiOperation({ summary: 'Delete a conversation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation deleted successfully',
  })
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
