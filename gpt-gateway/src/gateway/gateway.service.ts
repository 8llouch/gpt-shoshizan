import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { OllamaService } from "../ollama/ollama.service";

@Injectable()
export class GatewayService {
  private readonly apiClient: AxiosInstance;
  private readonly kafkaProducerClient: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly ollamaService: OllamaService,
  ) {
    this.apiClient = axios.create({
      baseURL:
        this.configService.get("API_SERVICE_URL") || "http://localhost:3001",
      timeout: 10000,
    });

    this.kafkaProducerClient = axios.create({
      baseURL:
        this.configService.get("KAFKA_PRODUCER_URL") || "http://localhost:3002",
      timeout: 10000,
    });
  }

  async routeToApi(
    path: string,
    method: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
  ): Promise<unknown> {
    try {
      const response: AxiosResponse = await this.apiClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `API Service Error: ${axiosError.message}`,
        axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async routeToKafkaProducer(
    path: string,
    method: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
  ): Promise<unknown> {
    try {
      const response: AxiosResponse = await this.kafkaProducerClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Kafka Producer Service Error: ${axiosError.message}`,
        axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
    } catch {
      health.api = "ERROR";
    }

    try {
      await this.kafkaProducerClient.get("/");
      health.kafkaProducer = "OK";
    } catch {
      health.kafkaProducer = "ERROR";
    }

    try {
      const isOllamaHealthy = await this.ollamaService.checkHealth();
      health.ollama = isOllamaHealthy ? "OK" : "ERROR";
    } catch {
      health.ollama = "ERROR";
    }

    return health;
  }
}
