import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { OllamaService } from "../ollama/ollama.service";

@Injectable()
export class GatewayService {
  private readonly apiClient: AxiosInstance;
  private readonly kafkaProducerClient: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly ollamaService: OllamaService
  ) {
    // API service client
    this.apiClient = axios.create({
      baseURL: this.configService.get("API_SERVICE_URL") || "http://localhost:3001",
      timeout: 10000,
    });

    // Kafka Producer service client
    this.kafkaProducerClient = axios.create({
      baseURL: this.configService.get("KAFKA_PRODUCER_URL") || "http://localhost:3002",
      timeout: 10000,
    });
  }

  // Route to API service
  async routeToApi(path: string, method: string, data?: any, headers?: any): Promise<any> {
    try {
      const response: AxiosResponse = await this.apiClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(`API Service Error: ${error.message}`, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Route to Kafka Producer service
  async routeToKafkaProducer(path: string, method: string, data?: any, headers?: any): Promise<any> {
    try {
      const response: AxiosResponse = await this.kafkaProducerClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(`Kafka Producer Service Error: ${error.message}`, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Health check for all services
  async healthCheck(): Promise<{
    gateway: string;
    api: string;
    kafkaProducer: string;
    ollama: string;
  }> {
    const health = {
      gateway: "OK",
      api: "UNKNOWN",
      kafkaProducer: "UNKNOWN",
      ollama: "UNKNOWN",
    };

    try {
      await this.apiClient.get("/");
      health.api = "OK";
    } catch (error) {
      health.api = "ERROR";
    }

    try {
      await this.kafkaProducerClient.get("/");
      health.kafkaProducer = "OK";
    } catch (error) {
      health.kafkaProducer = "ERROR";
    }

    try {
      const isOllamaHealthy = await this.ollamaService.checkHealth();
      health.ollama = isOllamaHealthy ? "OK" : "ERROR";
    } catch (error) {
      health.ollama = "ERROR";
    }

    return health;
  }
}
