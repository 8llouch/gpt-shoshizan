import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OllamaRequestDto } from "./dto/ollama-request.dto";
import { Response } from "express";

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.ollamaUrl = this.configService.get("OLLAMA_URL") || "http://localhost:11434";
  }

  async generateResponse(request: OllamaRequestDto, userId: string, response: Response): Promise<void> {
    try {
      this.logger.log(`Processing OLLAMA request for user ${userId}, model: ${request.model}`);

      // Prepare the request payload for OLLAMA
      const ollamaPayload = {
        model: request.model,
        prompt: request.prompt,
        stream: request.stream ?? true,
        context: request.context,
        system: request.system,
        template: request.template,
        images: request.images,
        options: request.options,
      };

      // Make request to OLLAMA server
      const ollamaResponse = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ollamaPayload),
      });

      if (!ollamaResponse.ok) {
        this.logger.error(`OLLAMA server error: ${ollamaResponse.status} ${ollamaResponse.statusText}`);
        throw new HttpException(`OLLAMA server error: ${ollamaResponse.statusText}`, HttpStatus.BAD_GATEWAY);
      }

      if (!ollamaResponse.body) {
        this.logger.error("No response body from OLLAMA server");
        throw new HttpException("No response body from OLLAMA server", HttpStatus.BAD_GATEWAY);
      }

      // Set headers for streaming response
      response.setHeader("Content-Type", "text/plain");
      response.setHeader("Transfer-Encoding", "chunked");
      response.setHeader("Cache-Control", "no-cache");
      response.setHeader("Connection", "keep-alive");

      // Stream the response from OLLAMA to the client
      const reader = ollamaResponse.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              // Validate JSON before sending
              JSON.parse(line);
              response.write(line + "\n");
            } catch (parseError) {
              this.logger.warn(`Invalid JSON chunk from OLLAMA: ${line}`);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      response.end();
      this.logger.log(`OLLAMA request completed for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error processing OLLAMA request: ${error.message}`, error.stack);

      if (!response.headersSent) {
        throw new HttpException("Failed to process OLLAMA request", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getModels(): Promise<any> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);

      if (!response.ok) {
        throw new HttpException(`Failed to fetch models: ${response.statusText}`, HttpStatus.BAD_GATEWAY);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Error fetching models: ${error.message}`);
      throw new HttpException("Failed to fetch available models", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      this.logger.warn(`OLLAMA health check failed: ${error.message}`);
      return false;
    }
  }
}
