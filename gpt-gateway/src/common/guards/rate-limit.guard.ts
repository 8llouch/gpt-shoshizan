import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from "../decorators/rate-limit.decorator";
import { Request } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RequestWithUser extends Request {
  user?: { sub: string };
}

interface RequestWithConnection {
  ip?: string;
  socket?: { remoteAddress?: string };
  connection?: { remoteAddress?: string };
  user?: { sub: string };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const key = this.generateKey(request, rateLimitOptions);
    const now = Date.now();

    this.cleanupExpiredEntries(now);

    const entry = this.store.get(key);

    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + rateLimitOptions.windowMs,
      });
      return true;
    }

    if (now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + rateLimitOptions.windowMs,
      });
      return true;
    }

    if (entry.count >= rateLimitOptions.maxRequests) {
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
      this.logger.warn(
        `Rate limit exceeded for key: ${key}. Try again in ${remainingTime} seconds.`,
      );

      throw new HttpException(
        {
          message: "Rate limit exceeded",
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfter: remainingTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    entry.count++;
    return true;
  }

  private generateKey(
    request: RequestWithUser,
    options: RateLimitOptions,
  ): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }

    const requestWithConnection = request as RequestWithConnection;
    const ip =
      requestWithConnection.ip ||
      requestWithConnection.socket?.remoteAddress ||
      requestWithConnection.connection?.remoteAddress ||
      "unknown";
    const userId = requestWithConnection.user?.sub || "anonymous";
    return `${ip}:${userId}`;
  }

  private cleanupExpiredEntries(now: number): void {
    if (Math.random() < 0.001) {
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetTime) {
          this.store.delete(key);
        }
      }
    }
  }
}
