import { Controller, All, Req, Res, UseGuards, HttpStatus, HttpException } from "@nestjs/common";
import { Request, Response } from "express";
import { GatewayService } from "./gateway.service";
import { JwtAuthGuard } from "../common/guards/jwt-authentication.guard";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { RateLimit } from "../common/decorators/rate-limit.decorator";
import { ApiOperation, ApiExcludeController, ApiResponse } from "@nestjs/swagger";

@ApiExcludeController()
@Controller("gateway")
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiOperation({ summary: "Health check for all services" })
  @ApiResponse({ status: 200, description: "Health status of all services" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 health checks per minute per IP
    keyGenerator: (req) => req.ip || "unknown",
  })
  @All("health")
  async healthCheck() {
    return this.gatewayService.healthCheck();
  }

  @ApiOperation({ summary: "Route to API service" })
  @ApiResponse({ status: 200, description: "Request routed successfully" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimit({
    windowMs: 60 * 1000,
    maxRequests: 100,
  })
  @All("api/*path")
  async routeToApi(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace("/gateway/api", "");
      const method = req.method.toLowerCase();
      const data = req.body;
      const headers = {
        Authorization: req.headers.authorization,
        "Content-Type": req.headers["content-type"],
      };

      const result = await this.gatewayService.routeToApi(path, method, data, headers);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: "Route to Kafka Producer service" })
  @ApiResponse({ status: 200, description: "Request routed successfully" })
  @ApiResponse({ status: 429, description: "Rate limit exceeded" })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimit({
    windowMs: 60 * 1000,
    maxRequests: 50,
  })
  @All("producer/*path")
  async routeToKafkaProducer(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace("/gateway/producer", "");
      const method = req.method.toLowerCase();
      const data = req.body;
      const headers = {
        Authorization: req.headers.authorization,
        "Content-Type": req.headers["content-type"],
      };

      const result = await this.gatewayService.routeToKafkaProducer(path, method, data, headers);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
