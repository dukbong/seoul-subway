import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log, maskSensitiveString, maskSensitiveData } from '../../lib/logger.js';

describe('log', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info level to console.log', () => {
    log({
      level: 'info',
      endpoint: '/api/test',
      method: 'GET',
      status: 200,
    });

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();

    const call = vi.mocked(console.log).mock.calls[0];
    const loggedValue = call?.[0];
    expect(loggedValue).toBeDefined();
    const parsed = JSON.parse(loggedValue as string);

    expect(parsed.level).toBe('info');
    expect(parsed.endpoint).toBe('/api/test');
    expect(parsed.method).toBe('GET');
    expect(parsed.status).toBe(200);
    expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should log warn level to console.log', () => {
    log({
      level: 'warn',
      endpoint: '/api/test',
      method: 'GET',
    });

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should log error level to console.error', () => {
    log({
      level: 'error',
      endpoint: '/api/test',
      method: 'GET',
      error: 'Something went wrong',
    });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.log).not.toHaveBeenCalled();

    const call = vi.mocked(console.error).mock.calls[0];
    const loggedValue = call?.[0];
    expect(loggedValue).toBeDefined();
    const parsed = JSON.parse(loggedValue as string);

    expect(parsed.level).toBe('error');
    expect(parsed.error).toBe('Something went wrong');
  });

  it('should include duration when provided', () => {
    log({
      level: 'info',
      endpoint: '/api/test',
      method: 'GET',
      duration: 150,
      status: 200,
    });

    const call = vi.mocked(console.log).mock.calls[0];
    const loggedValue = call?.[0];
    expect(loggedValue).toBeDefined();
    const parsed = JSON.parse(loggedValue as string);

    expect(parsed.duration).toBe(150);
  });

  it('should include additional properties', () => {
    log({
      level: 'info',
      endpoint: '/api/test',
      method: 'GET',
      customField: 'custom value',
      numericField: 42,
    });

    const call = vi.mocked(console.log).mock.calls[0];
    const loggedValue = call?.[0];
    expect(loggedValue).toBeDefined();
    const parsed = JSON.parse(loggedValue as string);

    expect(parsed.customField).toBe('custom value');
    expect(parsed.numericField).toBe(42);
  });

  it('should output valid JSON', () => {
    log({
      level: 'info',
      endpoint: '/api/test',
      method: 'GET',
    });

    const call = vi.mocked(console.log).mock.calls[0];
    const loggedValue = call?.[0];
    expect(loggedValue).toBeDefined();

    expect(() => JSON.parse(loggedValue as string)).not.toThrow();
  });

  it('should mask sensitive keys in log entries', () => {
    log({
      level: 'info',
      endpoint: '/api/test',
      method: 'GET',
      apiKey: 'secret-api-key-12345',
    });

    const call = vi.mocked(console.log).mock.calls[0];
    const loggedValue = call?.[0];
    expect(loggedValue).toBeDefined();
    const parsed = JSON.parse(loggedValue as string);

    expect(parsed.apiKey).toBe('***MASKED***');
    expect(parsed.apiKey).not.toContain('secret');
  });

  it('should mask sensitive data in URL strings', () => {
    log({
      level: 'info',
      endpoint: '/api/test',
      method: 'GET',
      url: 'https://api.example.com?serviceKey=secret123&other=value',
    });

    const call = vi.mocked(console.log).mock.calls[0];
    const loggedValue = call?.[0];
    expect(loggedValue).toBeDefined();
    const parsed = JSON.parse(loggedValue as string);

    expect(parsed.url).not.toContain('secret123');
    expect(parsed.url).toContain('***MASKED***');
    expect(parsed.url).toContain('other=value');
  });
});

describe('maskSensitiveString', () => {
  it('should mask serviceKey in query string', () => {
    const input = 'https://api.example.com?serviceKey=abcd1234&other=value';
    const result = maskSensitiveString(input);

    expect(result).not.toContain('abcd1234');
    expect(result).toContain('***MASKED***');
    expect(result).toContain('other=value');
  });

  it('should mask apikey (case-insensitive)', () => {
    const input = 'https://api.example.com?apiKey=secret&APIKEY=secret2';
    const result = maskSensitiveString(input);

    expect(result).not.toContain('secret');
    expect(result).toContain('***MASKED***');
  });

  it('should mask token in query string', () => {
    const input = 'https://api.example.com?token=mytoken123';
    const result = maskSensitiveString(input);

    expect(result).not.toContain('mytoken123');
  });

  it('should return unchanged string if no sensitive data', () => {
    const input = 'https://api.example.com?name=test&value=123';
    const result = maskSensitiveString(input);

    expect(result).toBe(input);
  });
});

describe('maskSensitiveData', () => {
  it('should mask sensitive keys in objects', () => {
    const input = {
      url: 'https://example.com',
      apiKey: 'secret123',
      data: 'normal data',
    };

    const result = maskSensitiveData(input) as Record<string, unknown>;

    expect(result.apiKey).toBe('***MASKED***');
    expect(result.data).toBe('normal data');
  });

  it('should handle nested objects', () => {
    const input = {
      request: {
        headers: {
          apiKey: 'secret',
        },
      },
    };

    const result = maskSensitiveData(input) as Record<string, unknown>;
    const request = result.request as Record<string, unknown>;
    const headers = request.headers as Record<string, unknown>;

    expect(headers.apiKey).toBe('***MASKED***');
  });

  it('should handle arrays', () => {
    const input = ['normal', 'apiKey=secret', 'data'];
    const result = maskSensitiveData(input) as string[];

    expect(result[0]).toBe('normal');
    expect(result[1]).toContain('***MASKED***');
    expect(result[2]).toBe('data');
  });

  it('should return null/undefined as-is', () => {
    expect(maskSensitiveData(null)).toBeNull();
    expect(maskSensitiveData(undefined)).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(maskSensitiveData(123)).toBe(123);
    expect(maskSensitiveData(true)).toBe(true);
  });
});
