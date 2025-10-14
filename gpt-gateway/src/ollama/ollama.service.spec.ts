import { Test, TestingModule } from "@nestjs/testing";
import { OllamaService } from "./ollama.service";
import { ConfigService } from "@nestjs/config";
import { HttpException, HttpStatus } from "@nestjs/common";
import { OllamaRequestDto } from "./dto/ollama-request.dto";
import { Response } from "express";

// Mock fetch globally
global.fetch = jest.fn();
global.AbortController = jest.fn(() => ({
  abort: jest.fn(),
  signal: {},
})) as any;

global.TextDecoder = jest.fn(() => ({
  decode: jest.fn().mockReturnValue('{"response":"test","done":true}'),
})) as any;

describe("OllamaService", () => {
  let service: OllamaService;
  let configService: jest.Mocked<ConfigService>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    mockResponse = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OllamaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OllamaService>(OllamaService);
    configService = module.get(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("constructor", () => {
    it("should use default OLLAMA_URL when not configured", () => {
      configService.get.mockReturnValue(undefined);

      // Access private property for testing
      const ollamaUrl = (service as any).ollamaUrl;
      expect(ollamaUrl).toBe("http://localhost:11434");
    });

    it("should use configured OLLAMA_URL", () => {
      configService.get.mockReturnValue("http://ollama-server:11434");

      // Create new service instance to test constructor
      const newService = new OllamaService(configService);
      const ollamaUrl = (newService as any).ollamaUrl;
      expect(ollamaUrl).toBe("http://ollama-server:11434");
    });
  });

  describe("generateResponse", () => {
    const mockRequest: OllamaRequestDto = {
      model: "llama2",
      prompt: "Hello world",
      stream: true,
      context: [1, 2, 3],
      system: "You are a helpful assistant",
      template: "test template",
      images: ["image1.jpg"],
      options: {
        temperature: 0.8,
        top_p: 0.9,
        num_ctx: 2048,
      },
    };

    it("should generate response successfully with streaming", async () => {
      const userId = "user-123";
      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new Uint8Array(Buffer.from('{"response":"test","done":false}\n')),
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn(),
      };

      const mockReadableStream = {
        getReader: jest.fn().mockReturnValue(mockReader),
      };

      const mockFetchResponse = {
        ok: true,
        body: mockReadableStream,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);
      mockResponse.headersSent = false;

      await service.generateResponse(mockRequest, userId, mockResponse as Response);

      expect(global.fetch).toHaveBeenCalledWith("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: mockRequest.model,
          prompt: mockRequest.prompt,
          stream: mockRequest.stream,
          context: mockRequest.context,
          system: mockRequest.system,
          template: mockRequest.template,
          images: mockRequest.images,
          options: { num_predict: 100, ...mockRequest.options },
        }),
        signal: expect.any(Object),
      });

      expect(mockResponse.setHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
      expect(mockResponse.setHeader).toHaveBeenCalledWith("Transfer-Encoding", "chunked");
      expect(mockResponse.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
      expect(mockResponse.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
      expect(mockReader.releaseLock).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it("should handle OLLAMA server error when headers not sent", async () => {
      const userId = "user-123";
      const mockFetchResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);
      mockResponse.headersSent = false; // Headers not sent

      await expect(service.generateResponse(mockRequest, userId, mockResponse as Response)).rejects.toThrow(
        new HttpException("Failed to process OLLAMA request", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it("should handle no response body when headers not sent", async () => {
      const userId = "user-123";
      const mockFetchResponse = {
        ok: true,
        body: null,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);
      mockResponse.headersSent = false; // Headers not sent

      await expect(service.generateResponse(mockRequest, userId, mockResponse as Response)).rejects.toThrow(
        new HttpException("Failed to process OLLAMA request", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it("should handle fetch errors", async () => {
      const userId = "user-123";
      const fetchError = new Error("Network error");

      (global.fetch as jest.Mock).mockRejectedValue(fetchError);
      mockResponse.headersSent = false;

      await expect(service.generateResponse(mockRequest, userId, mockResponse as Response)).rejects.toThrow(
        new HttpException("Failed to process OLLAMA request", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it("should handle streaming errors", async () => {
      const userId = "user-123";
      const mockReader = {
        read: jest.fn().mockRejectedValue(new Error("Stream error")),
        releaseLock: jest.fn(),
      };

      const mockReadableStream = {
        getReader: jest.fn().mockReturnValue(mockReader),
      };

      const mockFetchResponse = {
        ok: true,
        body: mockReadableStream,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);
      mockResponse.headersSent = false;

      await expect(service.generateResponse(mockRequest, userId, mockResponse as Response)).rejects.toThrow(
        new HttpException("Failed to process OLLAMA request", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it("should not throw when headers already sent", async () => {
      const userId = "user-123";
      const mockFetchResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);
      mockResponse.headersSent = true; // Headers already sent

      // Should not throw, just log error and return
      await service.generateResponse(mockRequest, userId, mockResponse as Response);

      // No expectations needed as function should complete without throwing
    });
  });

  describe("getModels", () => {
    it("should return models successfully", async () => {
      const mockModels = {
        models: [
          { name: "llama2", size: 3800000000 },
          { name: "codellama", size: 3800000000 },
        ],
      };

      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockModels),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const result = await service.getModels();

      expect(global.fetch).toHaveBeenCalledWith("http://localhost:11434/api/tags");
      expect(result).toEqual(mockModels);
    });

    it("should throw HttpException when fetch fails", async () => {
      const mockFetchResponse = {
        ok: false,
        statusText: "Service Unavailable",
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      await expect(service.getModels()).rejects.toThrow(
        new HttpException("Failed to fetch available models", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it("should handle network errors", async () => {
      const fetchError = new Error("Connection refused");

      (global.fetch as jest.Mock).mockRejectedValue(fetchError);

      await expect(service.getModels()).rejects.toThrow(
        new HttpException("Failed to fetch available models", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe("checkHealth", () => {
    it("should return true when OLLAMA server is healthy", async () => {
      const mockFetchResponse = {
        ok: true,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const result = await service.checkHealth();

      expect(global.fetch).toHaveBeenCalledWith("http://localhost:11434/api/tags", {
        method: "GET",
        signal: expect.any(Object),
      });
      expect(result).toBe(true);
    });

    it("should return false when OLLAMA server is unhealthy", async () => {
      const mockFetchResponse = {
        ok: false,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });

    it("should return false when fetch throws error", async () => {
      const fetchError = new Error("Connection timeout");

      (global.fetch as jest.Mock).mockRejectedValue(fetchError);

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });

    it("should handle timeout correctly", async () => {
      // Mock AbortController to simulate timeout
      const mockAbortController = {
        abort: jest.fn(),
        signal: { aborted: false },
      };

      // Mock the AbortController constructor
      global.AbortController = jest.fn().mockImplementation(() => mockAbortController);

      // Mock a fetch that throws AbortError
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      (global.fetch as jest.Mock).mockRejectedValue(abortError);

      const result = await service.checkHealth();

      expect(result).toBe(false);
    }, 2000);
  });
});
