import { Test, TestingModule } from "@nestjs/testing";
import { OllamaController } from "./ollama.controller";
import { OllamaService } from "./ollama.service";
import { JwtAuthGuard } from "../common/guards/jwt-authentication.guard";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { OllamaRequestDto } from "./dto/ollama-request.dto";
import { Response } from "express";

describe("OllamaController", () => {
  let controller: OllamaController;
  let service: jest.Mocked<OllamaService>;
  let mockResponse: Partial<Response>;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const mockService = {
      generateResponse: jest.fn(),
      getModels: jest.fn(),
      checkHealth: jest.fn(),
    };

    mockResponse = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OllamaController],
      providers: [
        {
          provide: OllamaService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<OllamaController>(OllamaController);
    service = module.get(OllamaService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("generateResponse", () => {
    const mockRequest = {
      user: {
        sub: "user-123",
        email: "test@example.com",
        role: "user",
        iat: 1234567890,
        exp: 1234567890,
      },
    };

    const ollamaRequest: OllamaRequestDto = {
      model: "llama2",
      prompt: "Hello, how are you?",
      stream: true,
      context: [1, 2, 3],
      system: "You are a helpful assistant",
      options: {
        temperature: 0.8,
        top_p: 0.9,
        num_ctx: 2048,
      },
    };

    it("should generate response successfully", async () => {
      service.generateResponse.mockResolvedValue(undefined);

      await controller.generateResponse(ollamaRequest, mockRequest, mockResponse as Response);

      expect(service.generateResponse).toHaveBeenCalledWith(ollamaRequest, mockRequest.user.sub, mockResponse);
      expect(service.generateResponse).toHaveBeenCalledTimes(1);
    });

    it("should handle service errors during generation", async () => {
      const error = new Error("OLLAMA service error");
      service.generateResponse.mockRejectedValue(error);


      const mockResponseObj = {
        headersSent: false,
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await controller.generateResponse(ollamaRequest, mockRequest, mockResponseObj as any);

      expect(service.generateResponse).toHaveBeenCalledWith(ollamaRequest, mockRequest.user.sub, mockResponseObj);
      expect(mockResponseObj.status).toHaveBeenCalledWith(500);
      expect(mockResponseObj.json).toHaveBeenCalledWith({
        error: "OLLAMA service error",
        statusCode: 500,
      });
    });

    it("should handle requests with minimal data", async () => {
      const minimalRequest: OllamaRequestDto = {
        model: "llama2",
        prompt: "Hello",
      };

      service.generateResponse.mockResolvedValue(undefined);

      await controller.generateResponse(minimalRequest, mockRequest, mockResponse as Response);

      expect(service.generateResponse).toHaveBeenCalledWith(minimalRequest, mockRequest.user.sub, mockResponse);
    });

    it("should handle requests with full options", async () => {
      const fullRequest: OllamaRequestDto = {
        model: "codellama",
        prompt: "Write a function in Python",
        stream: false,
        context: [1, 2, 3, 4, 5],
        system: "You are a code assistant",
        template: "custom template",
        images: ["image1.jpg", "image2.png"],
        options: {
          temperature: 0.5,
          top_p: 0.8,
          num_ctx: 4096,
          num_predict: 1000,
          repeat_penalty: 1.1,
          seed: 42,
        },
        conversationId: "conv-123",
      };

      service.generateResponse.mockResolvedValue(undefined);

      await controller.generateResponse(fullRequest, mockRequest, mockResponse as Response);

      expect(service.generateResponse).toHaveBeenCalledWith(fullRequest, mockRequest.user.sub, mockResponse);
    });
  });

  describe("getModels", () => {
    const mockRequest = {
      user: {
        sub: "user-123",
        email: "test@example.com",
        role: "user",
        iat: 1234567890,
        exp: 1234567890,
      },
    };

    it("should return available models successfully", async () => {
      const mockModels = {
        models: [
          { name: "llama2", size: 3800000000, digest: "sha256:abc123" },
          { name: "codellama", size: 3800000000, digest: "sha256:def456" },
          { name: "mistral", size: 4100000000, digest: "sha256:ghi789" },
        ],
      };

      service.getModels.mockResolvedValue(mockModels);

      const result = await controller.getModels(mockRequest);

      expect(result).toEqual(mockModels);
      expect(service.getModels).toHaveBeenCalledTimes(1);
    });

    it("should handle service errors when fetching models", async () => {
      const error = new Error("Failed to fetch models");
      service.getModels.mockRejectedValue(error);

      await expect(controller.getModels(mockRequest)).rejects.toThrow(error);
      expect(service.getModels).toHaveBeenCalledTimes(1);
    });

    it("should return empty models list when no models available", async () => {
      const emptyModels = { models: [] };
      service.getModels.mockResolvedValue(emptyModels);

      const result = await controller.getModels(mockRequest);

      expect(result).toEqual(emptyModels);
      expect(service.getModels).toHaveBeenCalledTimes(1);
    });
  });

  describe("checkHealth", () => {
    const mockRequest = {
      user: {
        sub: "user-123",
        email: "test@example.com",
        role: "user",
        iat: 1234567890,
        exp: 1234567890,
      },
    };

    it("should return healthy status when OLLAMA is running", async () => {
      service.checkHealth.mockResolvedValue(true);

      const result = await controller.checkHealth(mockRequest);

      expect(result).toEqual({
        status: "healthy",
        timestamp: expect.any(String),
        service: "OLLAMA",
      });
      expect(service.checkHealth).toHaveBeenCalledTimes(1);
    });

    it("should return unhealthy status when OLLAMA is not running", async () => {
      service.checkHealth.mockResolvedValue(false);

      const result = await controller.checkHealth(mockRequest);

      expect(result).toEqual({
        status: "unhealthy",
        timestamp: expect.any(String),
        service: "OLLAMA",
      });
      expect(service.checkHealth).toHaveBeenCalledTimes(1);
    });

    it("should handle service errors during health check", async () => {
      const error = new Error("Health check failed");
      service.checkHealth.mockRejectedValue(error);

      await expect(controller.checkHealth(mockRequest)).rejects.toThrow(error);
      expect(service.checkHealth).toHaveBeenCalledTimes(1);
    });

    it("should include valid timestamp in health response", async () => {
      service.checkHealth.mockResolvedValue(true);

      const result = await controller.checkHealth(mockRequest);

      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
      expect(typeof result.timestamp).toBe("string");
    });
  });
});
