import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GatewayService } from "./gateway.service";
import { GatewayController } from "./gateway.controller";
import { OllamaModule } from "../ollama/ollama.module";

@Module({
  imports: [ConfigModule, OllamaModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
