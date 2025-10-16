import { Test, TestingModule } from "@nestjs/testing";
import { SecureStringService } from "./secure-string.service";

describe("SecureStringService", () => {
  let service: SecureStringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecureStringService],
    }).compile();

    service = module.get<SecureStringService>(SecureStringService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("zeroMemory", () => {
    it("should attempt to zero memory for a string", () => {
      const sensitiveData = "SuperSecretPassword123!";
      const loggerSpy = jest.spyOn(service["logger"], "debug");

      service.zeroMemory(sensitiveData);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("Memory zeroed"),
      );
    });

    it("should handle empty strings gracefully", () => {
      expect(() => service.zeroMemory("")).not.toThrow();
    });

    it("should handle null/undefined gracefully", () => {
      expect(() => service.zeroMemory(null as any)).not.toThrow();
      expect(() => service.zeroMemory(undefined as any)).not.toThrow();
    });
  });

  describe("encrypt/decrypt", () => {
    it("should encrypt and decrypt a password correctly", () => {
      const plaintext = "MySecurePassword123!";

      const { encrypted, key, iv, authTag } = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(key).toHaveLength(32); // 256-bit key
      expect(iv).toHaveLength(16); // 128-bit IV

      const decrypted = service.decrypt(encrypted, key, iv, authTag);
      expect(decrypted).toBe(plaintext);
    });

    it("should produce different encrypted values for same input", () => {
      const plaintext = "SamePassword";

      const result1 = service.encrypt(plaintext);
      const result2 = service.encrypt(plaintext);

      // Different IV/key = different encrypted output
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it("should fail decryption with wrong key", () => {
      const plaintext = "MyPassword";
      const { encrypted, iv, authTag } = service.encrypt(plaintext);
      const wrongKey = Buffer.alloc(32, 0); // Wrong key

      expect(() => service.decrypt(encrypted, wrongKey, iv, authTag)).toThrow();
    });

    it("should fail decryption with tampered ciphertext", () => {
      const plaintext = "MyPassword";
      const { encrypted, key, iv, authTag } = service.encrypt(plaintext);
      const tamperedEncrypted = encrypted.replace(/a/g, "b"); // Tamper

      expect(() =>
        service.decrypt(tamperedEncrypted, key, iv, authTag),
      ).toThrow();
    });
  });

  describe("withSecurePassword", () => {
    it("should execute operation and zero memory afterwards", async () => {
      const password = "TestPassword123";
      const zeroSpy = jest.spyOn(service, "zeroMemory");

      const result = await service.withSecurePassword(
        password,
        async (pwd) => {
          expect(pwd).toBe(password);
          return "hashed_password";
        },
      );

      expect(result).toBe("hashed_password");
      expect(zeroSpy).toHaveBeenCalledWith(password);
    });

    it("should zero memory even if operation throws", async () => {
      const password = "TestPassword123";
      const zeroSpy = jest.spyOn(service, "zeroMemory");

      await expect(
        service.withSecurePassword(password, async () => {
          throw new Error("Operation failed");
        }),
      ).rejects.toThrow("Operation failed");

      expect(zeroSpy).toHaveBeenCalledWith(password);
    });

    it("should work with async bcrypt hash (real-world scenario)", async () => {
      const password = "RealPassword123!";
      const bcrypt = require("bcrypt");

      const hashedPassword = await service.withSecurePassword(
        password,
        async (pwd) => await bcrypt.hash(pwd, 10),
      );

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hash length
    });
  });

  describe("generateSecureToken", () => {
    it("should generate a cryptographically secure token", () => {
      const token = service.generateSecureToken();

      expect(token).toBeDefined();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[0-9a-f]+$/); // Hex format
    });

    it("should generate different tokens each time", () => {
      const token1 = service.generateSecureToken();
      const token2 = service.generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it("should respect custom length parameter", () => {
      const token = service.generateSecureToken(16);

      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });

  describe("cleanSensitiveObject", () => {
    it("should clean sensitive fields from an object", () => {
      const obj: Record<string, any> = {
        username: "john.doe",
        password: "SecretPassword123",
        email: "john@example.com",
        apiKey: "secret_api_key_xyz",
      };

      const zeroSpy = jest.spyOn(service, "zeroMemory");

      service.cleanSensitiveObject(obj, ["password", "apiKey"]);

      expect(obj.username).toBe("john.doe");
      expect(obj.email).toBe("john@example.com");
      expect(obj.password).toBeUndefined();
      expect(obj.apiKey).toBeUndefined();
      expect(zeroSpy).toHaveBeenCalledTimes(2);
    });

    it("should handle objects without sensitive fields", () => {
      const obj: Record<string, any> = {
        username: "john.doe",
        email: "john@example.com",
      };

      expect(() =>
        service.cleanSensitiveObject(obj, ["password"]),
      ).not.toThrow();
    });

    it("should handle null/undefined objects gracefully", () => {
      expect(() =>
        service.cleanSensitiveObject(null as any, ["password"]),
      ).not.toThrow();
      expect(() =>
        service.cleanSensitiveObject(undefined as any, ["password"]),
      ).not.toThrow();
    });

    it("should clean nested objects if needed", () => {
      const obj: Record<string, any> = {
        user: {
          name: "John",
          credentials: {
            password: "Secret123",
          },
        },
      };

      // Clean nested password (manual traversal needed)
      service.cleanSensitiveObject(obj.user.credentials, ["password"]);

      expect(obj.user.credentials.password).toBeUndefined();
    });

    it("should only clean string fields", () => {
      const obj: Record<string, any> = {
        password: "SecretPassword",
        count: 123,
        isActive: true,
        metadata: { key: "value" },
      };

      const zeroSpy = jest.spyOn(service, "zeroMemory");

      service.cleanSensitiveObject(obj, [
        "password",
        "count",
        "isActive",
        "metadata",
      ]);

      // Only password (string) should be zeroed and deleted
      expect(obj.password).toBeUndefined();
      expect(zeroSpy).toHaveBeenCalledTimes(1);
      expect(zeroSpy).toHaveBeenCalledWith("SecretPassword");

      // Non-string fields remain unchanged
      expect(obj.count).toBe(123);
      expect(obj.isActive).toBe(true);
      expect(obj.metadata).toEqual({ key: "value" });
    });
  });

  describe("Memory Security Integration Test", () => {
    it("should demonstrate full secure password workflow", async () => {
      // Simulate user registration flow
      const registerDto: Record<string, any> = {
        email: "test@example.com",
        password: "MySecurePassword123!",
        name: "Test User",
      };

      const zeroSpy = jest.spyOn(service, "zeroMemory");
      const bcrypt = require("bcrypt");

      // 1. Hash password with memory zeroing
      const hashedPassword = await service.withSecurePassword(
        registerDto.password,
        async (pwd) => await bcrypt.hash(pwd, 10),
      );

      expect(hashedPassword).toBeDefined();
      expect(zeroSpy).toHaveBeenCalledWith(registerDto.password);

      // 2. Clean the DTO
      service.cleanSensitiveObject(registerDto, ["password"]);

      expect(registerDto.password).toBeUndefined();
      expect(zeroSpy).toHaveBeenCalledTimes(2); // Once for hash, once for clean
    });
  });
});
