import { Module } from "@nestjs/common";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { SecureStringService } from "./security/secure-string.service";

@Module({
  providers: [RateLimitGuard, SecureStringService],
  exports: [RateLimitGuard, SecureStringService],
})
export class CommonModule {}
