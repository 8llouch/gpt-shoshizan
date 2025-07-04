import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Gateway health check" })
  @ApiResponse({ status: 200, description: "Gateway is running" })
  getHello(): string {
    return this.appService.getHello();
  }
}
