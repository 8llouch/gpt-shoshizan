import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { KafkaProducerService } from './kafka-producer.service';
import { LlmRequestMessageDto } from './dto/llm-request-message.dto';
import { LlmRequestMessage, JwtPayload } from '@shoshizan/shared-interfaces';
import { JwtAuthGuard } from '../common/guards/jwt-authentication.guard';

@Controller('message-producer')
export class KafkaProducerController {
  constructor(
    private readonly producerService: KafkaProducerService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('ai-inputs')
  async sendUserInput(
    @Body() input: LlmRequestMessageDto,
    @Request() req: { user: JwtPayload },
  ) {
    const message: LlmRequestMessage = {
      ...input,
      timestamp: new Date().toISOString(),
      userId: req.user.sub,
    };
    return this.producerService.produceMessage('input.created', message);
  }

  @UseGuards(JwtAuthGuard)
  @Post('ai-outputs')
  async sendAiOutput(
    @Body() output: LlmRequestMessageDto,
    @Request() req: { user: JwtPayload },
  ) {
    const message: LlmRequestMessage = {
      ...output,
      timestamp: new Date().toISOString(),
      userId: req.user.sub,
    };
    return this.producerService.produceMessage('output.created', message);
  }
}
