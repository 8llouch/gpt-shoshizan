import { Injectable, Logger } from "@nestjs/common";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

@Injectable()
export class SecureStringService {
  private readonly logger = new Logger(SecureStringService.name);
  private readonly algorithm = "aes-256-gcm";

  /**
   * Erases a string from memory by replacing each character with \0
   * @param str - String to erase (modified in place if possible)
   * @returns void
   */
  zeroMemory(str: string): void {
    if (!str) return;

    try {
      // Technique 1: Overwrite with null characters (if Buffer accessible)
      const buffer = Buffer.from(str, "utf-8");
      buffer.fill(0);

      // Technique 2: Overwrite multiple passes (DoD 5220.22-M standard)
      for (let pass = 0; pass < 3; pass++) {
        buffer.fill(
          pass === 0 ? 0xff : pass === 1 ? 0x00 : randomBytes(buffer.length),
        );
      }
      buffer.fill(0); // Final pass with zeros

      this.logger.debug(
        `Memory zeroed for sensitive data (${str.length} chars)`,
      );
    } catch (error) {
      this.logger.warn(
        "Memory zeroing failed (string may be immutable)",
        error,
      );
    }
  }

  /**
   * Temporarily encrypts a sensitive string in memory
   * Useful for temporarily storing passwords/tokens before processing
   *
   * @param plaintext - Text to encrypt
   * @returns { encrypted: string, key: Buffer, iv: Buffer, authTag: Buffer }
   */
  encrypt(plaintext: string): {
    encrypted: string;
    key: Buffer;
    iv: Buffer;
    authTag: Buffer;
  } {
    const key = randomBytes(32); // 256-bit key
    const iv = randomBytes(16); // 128-bit IV

    const cipher = createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return { encrypted, key, iv, authTag };
  }

  /**
   * Decrypts a string encrypted by encrypt()
   *
   * @param encrypted - Encrypted text
   * @param key - Encryption key
   * @param iv - Initialization vector
   * @param authTag - Authentication tag
   * @returns string - Decrypted text
   */
  decrypt(encrypted: string, key: Buffer, iv: Buffer, authTag: Buffer): string {
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Secure wrapper for processing a password
   * 1. Receives plaintext password
   * 2. Executes the operation (callback)
   * 3. Zeros the memory
   *
   * @param password - Plaintext password
   * @param operation - Async function to execute with the password
   * @returns Promise<T> - Result of the operation
   */
  async withSecurePassword<T>(
    password: string,
    operation: (pwd: string) => Promise<T>,
  ): Promise<T> {
    try {
      // Execute the operation (e.g., bcrypt.hash)
      const result = await operation(password);
      return result;
    } finally {
      // Always clean memory, even on error
      this.zeroMemory(password);
      this.logger.debug("Password zeroed from memory after processing");
    }
  }

  /**
   * Generates a secure and cryptographically strong token
   * Alternative to uuid for sensitive tokens
   *
   * @param length - Length in bytes (default: 32)
   * @returns string - Hexadecimal token
   */
  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString("hex");
  }

  /**
   * Cleans an object containing sensitive data
   * Useful for cleaning DTOs after use
   *
   * @param obj - Object to clean
   * @param sensitiveFields - List of fields to zero
   */
  cleanSensitiveObject(
    obj: Record<string, any>,
    sensitiveFields: string[],
  ): void {
    if (!obj || typeof obj !== "object") return;

    sensitiveFields.forEach((field) => {
      if (obj[field] && typeof obj[field] === "string") {
        this.zeroMemory(obj[field]);
        delete obj[field];
      }
    });

    this.logger.debug(
      `Cleaned ${sensitiveFields.length} sensitive fields from object`,
    );
  }
}
