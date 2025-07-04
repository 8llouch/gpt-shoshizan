import { Module } from "@nestjs/common";
import { RateLimitGuard } from "./guards/rate-limit.guard";

@Module({
  providers: [RateLimitGuard],
  exports: [RateLimitGuard],
})
export class CommonModule {}
