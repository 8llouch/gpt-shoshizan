import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OllamaController } from "./ollama.controller";
import { OllamaService } from "./ollama.service";

@Module({
  imports: [ConfigModule],
  controllers: [OllamaController],
  providers: [OllamaService],
  exports: [OllamaService],
})
export class OllamaModule {}
