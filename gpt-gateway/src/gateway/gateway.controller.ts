import { Controller, All, Req, Res, UseGuards, HttpStatus, HttpException } from "@nestjs/common";
import { Request, Response } from "express";
import { GatewayService } from "./gateway.service";
import { JwtAuthGuard } from "../common/guards/jwt-authentication.guard";
import { ApiOperation, ApiExcludeController } from "@nestjs/swagger";

@ApiExcludeController()
@Controller("gateway")
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiOperation({ summary: "Health check for all services" })
  @All("health")
  async healthCheck() {
    return this.gatewayService.healthCheck();
  }

  @ApiOperation({ summary: "Route to API service" })
  @UseGuards(JwtAuthGuard)
  @All("api/*")
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
  @UseGuards(JwtAuthGuard)
  @All("producer/*")
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
