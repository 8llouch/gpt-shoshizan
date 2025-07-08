import { RateLimitOptions } from "../decorators/rate-limit.decorator";
import { Request } from "express";

/**
 * This is the rate limit configuration for the gateway.
 * It is used to limit the number of requests to the gateway.
 * windowMs: The time window in milliseconds.
 * maxRequests: The maximum number of requests allowed within the window.
 * keyGenerator: A function that generates a key for the rate limit.
 * This is used to identify the user or IP address.
 * The keyGenerator is a function that takes a request object and returns a key.
 * The key is used to identify the user or IP address.
 */
export const RATE_LIMIT_CONFIG = {
  AUTH: {
    LOGIN: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 10,
      keyGenerator: (req: Request) => req.ip || "unknown",
    } as RateLimitOptions,

    REGISTER: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
      keyGenerator: (req: Request) => req.ip || "unknown",
    } as RateLimitOptions,

    PROFILE: {
      windowMs: 60 * 1000,
      maxRequests: 30,
    } as RateLimitOptions,
  },

  OLLAMA: {
    GENERATE: {
      windowMs: 60 * 1000,
      maxRequests: 30,
    } as RateLimitOptions,

    MODELS: {
      windowMs: 60 * 1000,
      maxRequests: 60,
    } as RateLimitOptions,

    HEALTH: {
      windowMs: 60 * 1000,
      maxRequests: 30,
    } as RateLimitOptions,
  },

  GATEWAY: {
    API_PROXY: {
      windowMs: 60 * 1000,
      maxRequests: 100,
    } as RateLimitOptions,

    KAFKA_PROXY: {
      windowMs: 60 * 1000,
      maxRequests: 50,
    } as RateLimitOptions,

    HEALTH: {
      windowMs: 60 * 1000,
      maxRequests: 60,
      keyGenerator: (req: Request) => req.ip || "unknown",
    } as RateLimitOptions,
  },

  CONVERSATIONS: {
    DEFAULT: {
      windowMs: 60 * 1000,
      maxRequests: 60,
    } as RateLimitOptions,
  },

  KAFKA_PRODUCER: {
    INPUTS: {
      windowMs: 60 * 1000,
      maxRequests: 30,
    } as RateLimitOptions,

    OUTPUTS: {
      windowMs: 60 * 1000,
      maxRequests: 30,
    } as RateLimitOptions,
  },
} as const;
