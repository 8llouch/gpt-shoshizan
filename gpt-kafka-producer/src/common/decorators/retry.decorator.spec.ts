import { Retry } from './retry.decorator';

interface Logger {
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
}

class TestClass {
  logger?: Logger;
  private attempts = 0;

  @Retry(3, 100)
  async successfulMethod(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return 'success';
  }

  @Retry(3, 100)
  async failingMethod(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    throw new Error('Operation failed');
  }

  @Retry(3, 100)
  async eventuallySuccessfulMethod(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.attempts++;
    if (this.attempts < 3) {
      throw new Error('Temporary failure');
    }
    return 'success after retries';
  }
}

describe('Retry Decorator', () => {
  let testClass: TestClass;
  let logger: Logger;

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    testClass = new TestClass();
    testClass.logger = logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('successful operations', () => {
    it('should execute successful method without retries', async () => {
      const result = await testClass.successfulMethod();
      expect(result).toBe('success');
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('failing operations', () => {
    it('should retry and eventually fail after max attempts', async () => {
      await expect(testClass.failingMethod()).rejects.toThrow(
        'Operation failed',
      );
      expect(logger.info).toHaveBeenCalledTimes(3);
      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        'All 3 attempts failed for failingMethod:',
        'Operation failed',
      );
    });

    it('should succeed after some retries', async () => {
      const result = await testClass.eventuallySuccessfulMethod();
      expect(result).toBe('success after retries');
      expect(logger.info).toHaveBeenCalledTimes(3);
      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('without logger', () => {
    it('should work without logging', async () => {
      testClass.logger = undefined;
      const result = await testClass.successfulMethod();
      expect(result).toBe('success');
    });

    it('should retry and fail without logging', async () => {
      testClass.logger = undefined;
      await expect(testClass.failingMethod()).rejects.toThrow(
        'Operation failed',
      );
    });
  });
});
