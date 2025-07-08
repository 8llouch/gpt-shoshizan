import { Test, TestingModule } from "@nestjs/testing";
import { GatewayService } from "./gateway.service";
import { ConfigService } from "@nestjs/config";
import { OllamaService } from "../ollama/ollama.service";
import { HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GatewayService", () => {
  let service: GatewayService;
  let configService: jest.Mocked<ConfigService>;
  let ollamaService: jest.Mocked<OllamaService>;
  let mockApiClient: any;
  let mockKafkaProducerClient: any;

  beforeEach(async () => {
    mockApiClient = {
      request: jest.fn(),
      get: jest.fn(),
    };

    mockKafkaProducerClient = {
      request: jest.fn(),
      get: jest.fn(),
    };

    mockedAxios.create = jest.fn().mockReturnValueOnce(mockApiClient).mockReturnValueOnce(mockKafkaProducerClient);

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockOllamaService = {
      checkHealth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: OllamaService,
          useValue: mockOllamaService,
        },
      ],
    }).compile();

    service = module.get<GatewayService>(GatewayService);
    configService = module.get(ConfigService);
    ollamaService = module.get(OllamaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("routeToApi", () => {
    it("should route request to API service successfully", async () => {
      const path = "/conversations";
      const method = "GET";
      const data = { test: "data" };
      const headers = { Authorization: "Bearer token" };
      const responseData = { result: "success" };

      mockApiClient.request.mockResolvedValue({ data: responseData });

      const result = await service.routeToApi(path, method, data, headers);

      expect(mockApiClient.request).toHaveBeenCalledWith({
        method,
        url: path,
        data,
        headers,
      });
      expect(result).toEqual(responseData);
    });

    it("should throw HttpException when API service request fails", async () => {
      const path = "/conversations";
      const method = "GET";
      const error = {
        message: "Network Error",
        response: { status: 500 },
      };

      mockApiClient.request.mockRejectedValue(error);

      await expect(service.routeToApi(path, method)).rejects.toThrow(new HttpException("API Service Error: Network Error", 500));
    });

    it("should throw HttpException with INTERNAL_SERVER_ERROR when no response status", async () => {
      const path = "/conversations";
      const method = "GET";
      const error = {
        message: "Network Error",
      };

      mockApiClient.request.mockRejectedValue(error);

      await expect(service.routeToApi(path, method)).rejects.toThrow(
        new HttpException("API Service Error: Network Error", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe("routeToKafkaProducer", () => {
    it("should route request to Kafka Producer service successfully", async () => {
      const path = "/messages";
      const method = "POST";
      const data = { message: "test" };
      const headers = { Authorization: "Bearer token" };
      const responseData = { messageId: "123" };

      mockKafkaProducerClient.request.mockResolvedValue({ data: responseData });

      const result = await service.routeToKafkaProducer(path, method, data, headers);

      expect(mockKafkaProducerClient.request).toHaveBeenCalledWith({
        method,
        url: path,
        data,
        headers,
      });
      expect(result).toEqual(responseData);
    });

    it("should throw HttpException when Kafka Producer service request fails", async () => {
      const path = "/messages";
      const method = "POST";
      const error = {
        message: "Connection refused",
        response: { status: 503 },
      };

      mockKafkaProducerClient.request.mockRejectedValue(error);

      await expect(service.routeToKafkaProducer(path, method)).rejects.toThrow(
        new HttpException("Kafka Producer Service Error: Connection refused", 503)
      );
    });

    it("should throw HttpException with INTERNAL_SERVER_ERROR when no response status", async () => {
      const path = "/messages";
      const method = "POST";
      const error = {
        message: "Connection refused",
      };

      mockKafkaProducerClient.request.mockRejectedValue(error);

      await expect(service.routeToKafkaProducer(path, method)).rejects.toThrow(
        new HttpException("Kafka Producer Service Error: Connection refused", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe("healthCheck", () => {
    it("should return health status for all services when all are healthy", async () => {
      mockApiClient.get.mockResolvedValue({ status: 200 });
      mockKafkaProducerClient.get.mockResolvedValue({ status: 200 });
      ollamaService.checkHealth.mockResolvedValue(true);

      const result = await service.healthCheck();

      expect(result).toEqual({
        gateway: "OK",
        api: "OK",
        kafkaProducer: "OK",
        ollama: "OK",
      });
    });

    it("should return error status for API service when unhealthy", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Connection failed"));
      mockKafkaProducerClient.get.mockResolvedValue({ status: 200 });
      ollamaService.checkHealth.mockResolvedValue(true);

      const result = await service.healthCheck();

      expect(result).toEqual({
        gateway: "OK",
        api: "ERROR",
        kafkaProducer: "OK",
        ollama: "OK",
      });
    });

    it("should return error status for Kafka Producer service when unhealthy", async () => {
      mockApiClient.get.mockResolvedValue({ status: 200 });
      mockKafkaProducerClient.get.mockRejectedValue(new Error("Service unavailable"));
      ollamaService.checkHealth.mockResolvedValue(true);

      const result = await service.healthCheck();

      expect(result).toEqual({
        gateway: "OK",
        api: "OK",
        kafkaProducer: "ERROR",
        ollama: "OK",
      });
    });

    it("should return error status for Ollama service when unhealthy", async () => {
      mockApiClient.get.mockResolvedValue({ status: 200 });
      mockKafkaProducerClient.get.mockResolvedValue({ status: 200 });
      ollamaService.checkHealth.mockResolvedValue(false);

      const result = await service.healthCheck();

      expect(result).toEqual({
        gateway: "OK",
        api: "OK",
        kafkaProducer: "OK",
        ollama: "ERROR",
      });
    });

    it("should return error status for Ollama when checkHealth throws error", async () => {
      mockApiClient.get.mockResolvedValue({ status: 200 });
      mockKafkaProducerClient.get.mockResolvedValue({ status: 200 });
      ollamaService.checkHealth.mockRejectedValue(new Error("Ollama unreachable"));

      const result = await service.healthCheck();

      expect(result).toEqual({
        gateway: "OK",
        api: "OK",
        kafkaProducer: "OK",
        ollama: "ERROR",
      });
    });

    it("should return error status for all external services when all are unhealthy", async () => {
      mockApiClient.get.mockRejectedValue(new Error("API down"));
      mockKafkaProducerClient.get.mockRejectedValue(new Error("Kafka down"));
      ollamaService.checkHealth.mockRejectedValue(new Error("Ollama down"));

      const result = await service.healthCheck();

      expect(result).toEqual({
        gateway: "OK",
        api: "ERROR",
        kafkaProducer: "ERROR",
        ollama: "ERROR",
      });
    });
  });
});
