import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return response on successful fetch', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), { status: 200 });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse);

    const response = await fetchWithRetry('https://example.com/api');

    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 5xx errors', async () => {
    const mockError = new Response('Server Error', { status: 500 });
    const mockSuccess = new Response(JSON.stringify({ data: 'test' }), { status: 200 });

    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(mockError)
      .mockResolvedValueOnce(mockSuccess);

    const fetchPromise = fetchWithRetry('https://example.com/api', { retries: 2, retryDelay: 100 });

    // Advance through the retry delay
    await vi.advanceTimersByTimeAsync(100);

    const response = await fetchPromise;

    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should retry on 429 rate limit errors', async () => {
    const mockRateLimit = new Response('Too Many Requests', { status: 429 });
    const mockSuccess = new Response(JSON.stringify({ data: 'test' }), { status: 200 });

    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(mockRateLimit)
      .mockResolvedValueOnce(mockSuccess);

    const fetchPromise = fetchWithRetry('https://example.com/api', { retries: 2, retryDelay: 100 });

    await vi.advanceTimersByTimeAsync(100);

    const response = await fetchPromise;

    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should return 4xx errors without retry', async () => {
    const mockClientError = new Response('Not Found', { status: 404 });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockClientError);

    const response = await fetchWithRetry('https://example.com/api', { retries: 3 });

    expect(response.status).toBe(404);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should use exponential backoff for retries', async () => {
    const mockError = new Response('Server Error', { status: 500 });

    vi.spyOn(global, 'fetch').mockResolvedValue(mockError);

    const fetchPromise = fetchWithRetry('https://example.com/api', { retries: 3, retryDelay: 100 });

    // First retry after 100ms (100 * 2^0)
    await vi.advanceTimersByTimeAsync(100);
    expect(fetch).toHaveBeenCalledTimes(2);

    // Second retry after 200ms (100 * 2^1)
    await vi.advanceTimersByTimeAsync(200);
    expect(fetch).toHaveBeenCalledTimes(3);

    // Third retry after 400ms (100 * 2^2)
    await vi.advanceTimersByTimeAsync(400);
    expect(fetch).toHaveBeenCalledTimes(4);

    const response = await fetchPromise;
    expect(response.status).toBe(500);
  });

  it('should throw on network error after max retries', async () => {
    vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    const fetchPromise = fetchWithRetry('https://example.com/api', { retries: 2, retryDelay: 100 });

    // Run all timers and wait for promise resolution
    await vi.runAllTimersAsync();

    await expect(fetchPromise).rejects.toThrow('Network error');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('should respect timeout option', async () => {
    vi.useRealTimers(); // Use real timers for abort test

    // Mock fetch to simulate a timeout
    vi.spyOn(global, 'fetch').mockImplementation(async (_, options) => {
      const signal = options?.signal as AbortSignal;
      return new Promise((_, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new Error('The operation was aborted'));
        });
      });
    });

    await expect(
      fetchWithRetry('https://example.com/api', { timeout: 50, retries: 0 })
    ).rejects.toThrow();
  });

  it('should use default options when not provided', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), { status: 200 });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse);

    const response = await fetchWithRetry('https://example.com/api');

    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });
});
