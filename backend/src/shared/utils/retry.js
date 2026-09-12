// src/shared/utils/retry.js
export async function withRetry(fn, { maxRetries = 3, baseDelay = 1000 } = {}) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (e) {
        lastError = e;
        // Only retry on 5xx or network errors, not 4xx
        if (e.status && e.status < 500) throw e;
        if (i < maxRetries) {
          const delay = baseDelay * Math.pow(2, i) + Math.random() * 500;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }   