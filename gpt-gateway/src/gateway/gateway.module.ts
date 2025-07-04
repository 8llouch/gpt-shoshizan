import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GatewayService } from "./gateway.service";
import { GatewayController } from "./gateway.controller";

@Module({
  imports: [ConfigModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
