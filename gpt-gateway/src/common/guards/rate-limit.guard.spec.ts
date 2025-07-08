import { Test, TestingModule } from "@nestjs/testing";
import { RateLimitGuard } from "./rate-limit.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { RATE_LIMIT_KEY, RateLimitOptions } from "../decorators/rate-limit.decorator";

describe("RateLimitGuard", () => {
  let guard: RateLimitGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RateLimitGuard>(RateLimitGuard);
    reflector = module.get(Reflector);

    // Clear the internal store before each test
    (guard as any).store.clear();
  });

  const createMockExecutionContext = (request: any): jest.Mocked<ExecutionContext> => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    };
  };

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should return true when no rate limit options are set", () => {
      reflector.get.mockReturnValue(undefined);

      const mockRequest = { ip: "127.0.0.1" };
      const mockContext = createMockExecutionContext(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(RATE_LIMIT_KEY, mockContext.getHandler());
    });

    it("should allow first request within rate limit", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 60000, // 1 minute
        maxRequests: 10,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = { ip: "127.0.0.1" };
      const mockContext = createMockExecutionContext(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it("should allow multiple requests within rate limit", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 60000,
        maxRequests: 5,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = { ip: "127.0.0.1" };
      const mockContext = createMockExecutionContext(mockRequest);

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const result = guard.canActivate(mockContext);
        expect(result).toBe(true);
      }
    });

    it("should throw HttpException when rate limit is exceeded", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 60000,
        maxRequests: 2,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = { ip: "127.0.0.1" };
      const mockContext = createMockExecutionContext(mockRequest);

      // Make 2 requests (within limit)
      expect(guard.canActivate(mockContext)).toBe(true);
      expect(guard.canActivate(mockContext)).toBe(true);

      // Third request should throw
      expect(() => guard.canActivate(mockContext)).toThrow(
        new HttpException(
          {
            message: "Rate limit exceeded",
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            retryAfter: expect.any(Number),
          },
          HttpStatus.TOO_MANY_REQUESTS
        )
      );
    });

    it("should reset rate limit after time window expires", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 100, // 100ms for quick test
        maxRequests: 1,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = { ip: "127.0.0.1" };
      const mockContext = createMockExecutionContext(mockRequest);

      // First request should be allowed
      expect(guard.canActivate(mockContext)).toBe(true);

      // Second request immediately should throw
      expect(() => guard.canActivate(mockContext)).toThrow(HttpException);

      // Mock time passage
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now + 150); // 150ms later

      // Request after window should be allowed
      expect(guard.canActivate(mockContext)).toBe(true);

      jest.restoreAllMocks();
    });

    it("should use custom key generator when provided", () => {
      const customKeyGenerator = jest.fn().mockReturnValue("custom-key");
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 60000,
        maxRequests: 1,
        keyGenerator: customKeyGenerator,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = { ip: "127.0.0.1", user: { sub: "user-123" } };
      const mockContext = createMockExecutionContext(mockRequest);

      guard.canActivate(mockContext);

      expect(customKeyGenerator).toHaveBeenCalledWith(mockRequest);
    });

    it("should use default key generator with IP and user ID", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 60000,
        maxRequests: 1,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = {
        ip: "192.168.1.1",
        user: { sub: "user-456" },
      };
      const mockContext = createMockExecutionContext(mockRequest);

      guard.canActivate(mockContext);

      // Verify that the key is generated correctly by checking internal store
      const store = (guard as any).store;
      const keys = Array.from(store.keys());
      expect(keys).toContain("192.168.1.1:user-456");
    });

    it("should handle requests without IP address", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 60000,
        maxRequests: 1,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = {
        connection: { remoteAddress: "10.0.0.1" },
        user: { sub: "user-789" },
      };
      const mockContext = createMockExecutionContext(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      const store = (guard as any).store;
      const keys = Array.from(store.keys());
      expect(keys).toContain("10.0.0.1:user-789");
    });

    it("should handle requests without user information", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 60000,
        maxRequests: 1,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = { ip: "203.0.113.1" };
      const mockContext = createMockExecutionContext(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      const store = (guard as any).store;
      const keys = Array.from(store.keys());
      expect(keys).toContain("203.0.113.1:anonymous");
    });

    it("should handle requests with unknown IP", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 60000,
        maxRequests: 1,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = { connection: {} }; // Empty connection object
      const mockContext = createMockExecutionContext(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      const store = (guard as any).store;
      const keys = Array.from(store.keys());
      expect(keys).toContain("unknown:anonymous");
    });
  });

  describe("cleanupExpiredEntries", () => {
    it("should clean up expired entries periodically", () => {
      const rateLimitOptions: RateLimitOptions = {
        windowMs: 100,
        maxRequests: 1,
      };

      reflector.get.mockReturnValue(rateLimitOptions);

      const mockRequest = { ip: "127.0.0.1" };
      const mockContext = createMockExecutionContext(mockRequest);

      // Make a request to create an entry
      guard.canActivate(mockContext);

      const store = (guard as any).store;
      expect(store.size).toBe(1);

      // Mock random to trigger cleanup
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.0001); // Always trigger cleanup

      // Mock time passage to make entry expired
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now + 200);

      // Trigger cleanup by making another request
      const mockRequest2 = { ip: "127.0.0.2" };
      const mockContext2 = createMockExecutionContext(mockRequest2);
      guard.canActivate(mockContext2);

      // The expired entry should be cleaned up
      expect(store.size).toBe(1); // Only the new entry should remain
      const keys = Array.from(store.keys());
      expect(keys).toContain("127.0.0.2:anonymous");
      expect(keys).not.toContain("127.0.0.1:anonymous");

      // Restore mocks
      Math.random = originalRandom;
      jest.restoreAllMocks();
    });
  });
});
