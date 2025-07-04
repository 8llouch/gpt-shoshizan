import { Controller, Post, Get, Body, UseGuards, Request, Response, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-authentication.guard";
import { OllamaService } from "./ollama.service";
import { OllamaRequestDto } from "./dto/ollama-request.dto";
import { JwtPayload } from "@shoshizan/shared-interfaces";
import { Response as ExpressResponse } from "express";

@ApiTags("OLLAMA")
@Controller("gateway/ollama")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OllamaController {
  private readonly logger = new Logger(OllamaController.name);
  private readonly userRequestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per user

  constructor(private readonly ollamaService: OllamaService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate AI response using OLLAMA" })
  @ApiResponse({ status: 200, description: "Streaming response from OLLAMA" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @ApiResponse({ status: 502, description: "OLLAMA server error" })
  async generateResponse(
    @Body() request: OllamaRequestDto,
    @Request() req: { user: JwtPayload },
    @Response() response: ExpressResponse
  ): Promise<void> {
    const userId = req.user.sub;

    try {
      // Check rate limiting
      if (!this.checkRateLimit(userId)) {
        this.logger.warn(`Rate limit exceeded for user ${userId}`);
        throw new HttpException("Rate limit exceeded. Please try again later.", HttpStatus.TOO_MANY_REQUESTS);
      }

      // Increment request count
      this.incrementRequestCount(userId);

      this.logger.log(`Processing OLLAMA request for user ${userId}, model: ${request.model}`);

      // Delegate to service
      await this.ollamaService.generateResponse(request, userId, response);
    } catch (error) {
      this.logger.error(`Error in OLLAMA controller: ${error.message}`, error.stack);

      if (!response.headersSent) {
        response.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        response.json({
          error: error.message || "Internal server error",
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @Get("models")
  @ApiOperation({ summary: "Get available OLLAMA models" })
  @ApiResponse({ status: 200, description: "List of available models" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 502, description: "OLLAMA server error" })
  async getModels(@Request() req: { user: JwtPayload }) {
    const userId = req.user.sub;
    this.logger.log(`Fetching models for user ${userId}`);

    return await this.ollamaService.getModels();
  }

  @Get("health")
  @ApiOperation({ summary: "Check OLLAMA server health" })
  @ApiResponse({ status: 200, description: "OLLAMA health status" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
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

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userStats = this.userRequestCounts.get(userId);

    if (!userStats) {
      return true; // First request
    }

    // Reset counter if window has passed
    if (now > userStats.resetTime) {
      this.userRequestCounts.delete(userId);
      return true;
    }

    // Check if under limit
    return userStats.count < this.RATE_LIMIT_MAX_REQUESTS;
  }

  private incrementRequestCount(userId: string): void {
    const now = Date.now();
    const userStats = this.userRequestCounts.get(userId);

    if (!userStats || now > userStats.resetTime) {
      // First request or reset window
      this.userRequestCounts.set(userId, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      });
    } else {
      // Increment existing count
      userStats.count++;
    }
  }
}
