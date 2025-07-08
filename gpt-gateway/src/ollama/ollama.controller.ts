import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Response,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-authentication.guard";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { RateLimit } from "../common/decorators/rate-limit.decorator";
import { OllamaService } from "./ollama.service";
import { OllamaRequestDto } from "./dto/ollama-request.dto";
import { JwtPayload } from "@shoshizan/shared-interfaces";
import { Response as ExpressResponse } from "express";

interface ErrorWithStatus extends Error {
  status?: number;
}

@ApiTags("OLLAMA")
@Controller("gateway/ollama")
@UseGuards(JwtAuthGuard, RateLimitGuard)
@ApiBearerAuth()
export class OllamaController {
  private readonly logger = new Logger(OllamaController.name);

  constructor(private readonly ollamaService: OllamaService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate AI response using OLLAMA" })
  @ApiResponse({ status: 200, description: "Streaming response from OLLAMA" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @ApiResponse({ status: 502, description: "OLLAMA server error" })
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute per user
  })
  async generateResponse(
    @Body() request: OllamaRequestDto,
    @Request() req: { user: JwtPayload },
    @Response() response: ExpressResponse,
  ): Promise<void> {
    const userId = req.user.sub;

    try {
      this.logger.log(
        `Processing OLLAMA request for user ${userId}, model: ${request.model}`,
      );

      // Delegate to service
      await this.ollamaService.generateResponse(request, userId, response);
    } catch (error) {
      const errorWithStatus = error as ErrorWithStatus;
      this.logger.error(
        `Error in OLLAMA controller: ${errorWithStatus.message}`,
        errorWithStatus.stack,
      );

      if (!response.headersSent) {
        const statusCode =
          errorWithStatus.status || HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(statusCode);
        response.json({
          error: errorWithStatus.message || "Internal server error",
          statusCode: statusCode,
        });
      }
    }
  }

  @Get("models")
  @ApiOperation({ summary: "Get available OLLAMA models" })
  @ApiResponse({ status: 200, description: "List of available models" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @ApiResponse({ status: 502, description: "OLLAMA server error" })
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 model requests per minute per user
  })
  async getModels(@Request() req: { user: JwtPayload }): Promise<unknown> {
    const userId = req.user.sub;
    this.logger.log(`Fetching models for user ${userId}`);

    return await this.ollamaService.getModels();
  }

  @Get("health")
  @ApiOperation({ summary: "Check OLLAMA server health" })
  @ApiResponse({ status: 200, description: "OLLAMA health status" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 health checks per minute per user
  })
  async checkHealth(@Request() req: { user: JwtPayload }) {
    const userId = req.user.sub;
    this.logger.log(`Health check requested by user ${userId}`);

    const isHealthy = await this.ollamaService.checkHealth();

    return {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      service: "OLLAMA",
    };
  }
}
