interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

interface WithLogger {
  logger?: Logger;
}

type AsyncMethod<T extends any[], R> = (...args: T) => Promise<R>;

export function Retry(maxRetry = 3, retryDelay = 1000) {
  return function <T extends any[], R>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<AsyncMethod<T, R>>,
  ): TypedPropertyDescriptor<AsyncMethod<T, R>> {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      throw new Error(`Method ${propertyKey} is not defined`);
    }

    descriptor.value = async function (
      this: WithLogger,
      ...args: T
    ): Promise<R> {
      let attempt = 0;
      let lastError: unknown;

      while (attempt < maxRetry) {
        try {
          if (this.logger) {
            this.logger.info(
              `Attempt ${attempt + 1}/${maxRetry} for ${propertyKey} with args:`,
              ...args,
            );
          }
          return (await originalMethod.call(this, ...args)) as R;
        } catch (error) {
          lastError = error;
          attempt++;

          if (attempt < maxRetry) {
            if (this.logger) {
              this.logger.warn(
                `Retrying ${propertyKey} (attempt ${attempt + 1}/${maxRetry}) in ${retryDelay}ms...`,
              );
            }
            await new Promise<void>((resolve) =>
              setTimeout(resolve, retryDelay),
            );
          }
        }
      }

      if (this.logger) {
        const errorMessage =
          lastError instanceof Error ? lastError.message : String(lastError);
        this.logger.error(
          `All ${maxRetry} attempts failed for ${propertyKey}:`,
          errorMessage,
        );
      }

      throw lastError;
    };

    return descriptor;
  };
}
