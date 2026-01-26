
// D1 retry wrapper for transient errors
const RETRYABLE_ERRORS = [
  'Network connection lost',
  'D1 DB reset',
  'Cannot resolve D1 DB',
  'transient issue'
];

export async function withD1Retry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const message = error?.message || '';

      // Check if this is a retryable error
      const isRetryable = RETRYABLE_ERRORS.some(e => message.includes(e));

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 100ms, 200ms, 400ms...
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError;
}
