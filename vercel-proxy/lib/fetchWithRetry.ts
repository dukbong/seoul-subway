interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 10000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) return response;

      // 5xx errors or 429 should be retried
      if ((response.status >= 500 || response.status === 429) && attempt < retries) {
        await sleep(retryDelay * Math.pow(2, attempt)); // exponential backoff
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (attempt === retries) throw error;
      await sleep(retryDelay * Math.pow(2, attempt));
    }
  }

  throw new Error('Max retries exceeded');
}
