import { Test, TestingModule } from "@nestjs/testing";
import { GatewayController } from "./gateway.controller";
import { GatewayService } from "./gateway.service";
import { JwtAuthGuard } from "../common/guards/jwt-authentication.guard";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

describe("GatewayController", () => {
  let controller: GatewayController;
  let service: jest.Mocked<GatewayService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const mockService = {
      healthCheck: jest.fn(),
      routeToApi: jest.fn(),
      routeToKafkaProducer: jest.fn(),
    };

    mockRequest = {
      url: "/gateway/api/conversations",
      method: "GET",
      body: {},
      headers: {
        authorization: "Bearer token",
        "content-type": "application/json",
      },
      ip: "127.0.0.1",
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: GatewayService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<GatewayController>(GatewayController);
    service = module.get(GatewayService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("healthCheck", () => {
    it("should return health status for all services", async () => {
      const healthStatus = {
        gateway: "OK",
        api: "OK",
        kafkaProducer: "OK",
        ollama: "OK",
      };

      service.healthCheck.mockResolvedValue(healthStatus);

      const result = await controller.healthCheck();

      expect(result).toEqual(healthStatus);
      expect(service.healthCheck).toHaveBeenCalledTimes(1);
    });

    it("should handle health check errors", async () => {
      const error = new Error("Health check failed");
      service.healthCheck.mockRejectedValue(error);

      await expect(controller.healthCheck()).rejects.toThrow(error);
      expect(service.healthCheck).toHaveBeenCalledTimes(1);
    });
  });

  describe("routeToApi", () => {
    it("should route request to API service successfully", async () => {
      const responseData = { conversations: [] };
      service.routeToApi.mockResolvedValue(responseData);

      await controller.routeToApi(mockRequest as Request, mockResponse as Response);

      expect(service.routeToApi).toHaveBeenCalledWith(
        "/conversations",
        "get",
        {},
        {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(responseData);
    });

    it("should handle POST request with body data", async () => {
      const requestBody = { message: "test message" };
      const responseData = { id: "message-123" };

      mockRequest.method = "POST";
      mockRequest.body = requestBody;
      service.routeToApi.mockResolvedValue(responseData);

      await controller.routeToApi(mockRequest as Request, mockResponse as Response);

      expect(service.routeToApi).toHaveBeenCalledWith("/conversations", "post", requestBody, {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(responseData);
    });

    it("should handle service errors and throw HttpException", async () => {
      const serviceError = new HttpException("Service unavailable", HttpStatus.SERVICE_UNAVAILABLE);
      service.routeToApi.mockRejectedValue(serviceError);

      await expect(controller.routeToApi(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        new HttpException("Service unavailable", HttpStatus.SERVICE_UNAVAILABLE)
      );
    });

    it("should handle generic errors with default status", async () => {
      const genericError = new Error("Unexpected error");
      service.routeToApi.mockRejectedValue(genericError);

      await expect(controller.routeToApi(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        new HttpException("Unexpected error", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it("should extract path correctly from complex URLs", async () => {
      mockRequest.url = "/gateway/api/conversations/123/messages";
      const responseData = { messages: [] };
      service.routeToApi.mockResolvedValue(responseData);

      await controller.routeToApi(mockRequest as Request, mockResponse as Response);

      expect(service.routeToApi).toHaveBeenCalledWith(
        "/conversations/123/messages",
        "get",
        {},
        {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        }
      );
    });
  });

  describe("routeToKafkaProducer", () => {
    it("should route request to Kafka Producer service successfully", async () => {
      const requestBody = { topic: "messages", data: "test" };
      const responseData = { messageId: "msg-123", status: "sent" };

      mockRequest.url = "/gateway/producer/send";
      mockRequest.method = "POST";
      mockRequest.body = requestBody;
      service.routeToKafkaProducer.mockResolvedValue(responseData);

      await controller.routeToKafkaProducer(mockRequest as Request, mockResponse as Response);

      expect(service.routeToKafkaProducer).toHaveBeenCalledWith("/send", "post", requestBody, {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(responseData);
    });

    it("should handle GET request to Kafka Producer", async () => {
      const responseData = { topics: ["messages", "responses"] };

      mockRequest.url = "/gateway/producer/topics";
      mockRequest.method = "GET";
      service.routeToKafkaProducer.mockResolvedValue(responseData);

      await controller.routeToKafkaProducer(mockRequest as Request, mockResponse as Response);

      expect(service.routeToKafkaProducer).toHaveBeenCalledWith(
        "/topics",
        "get",
        {},
        {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(responseData);
    });

    it("should handle service errors and throw HttpException", async () => {
      const serviceError = new HttpException("Kafka Producer Error", HttpStatus.BAD_GATEWAY);
      service.routeToKafkaProducer.mockRejectedValue(serviceError);

      await expect(controller.routeToKafkaProducer(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        new HttpException("Kafka Producer Error", HttpStatus.BAD_GATEWAY)
      );
    });

    it("should handle generic errors with default status", async () => {
      const genericError = new Error("Connection timeout");
      service.routeToKafkaProducer.mockRejectedValue(genericError);

      await expect(controller.routeToKafkaProducer(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        new HttpException("Connection timeout", HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it("should extract path correctly from Kafka Producer URLs", async () => {
      mockRequest.url = "/gateway/producer/messages/queue/priority";
      const responseData = { queue: "priority", status: "ready" };
      service.routeToKafkaProducer.mockResolvedValue(responseData);

      await controller.routeToKafkaProducer(mockRequest as Request, mockResponse as Response);

      expect(service.routeToKafkaProducer).toHaveBeenCalledWith(
        "/messages/queue/priority",
        "get",
        {},
        {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        }
      );
    });
  });
});
