import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log } from '../../lib/logger.js';

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

    const loggedValue = vi.mocked(console.log).mock.calls[0][0];
    const parsed = JSON.parse(loggedValue);

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

    const loggedValue = vi.mocked(console.error).mock.calls[0][0];
    const parsed = JSON.parse(loggedValue);

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

    const loggedValue = vi.mocked(console.log).mock.calls[0][0];
    const parsed = JSON.parse(loggedValue);

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

    const loggedValue = vi.mocked(console.log).mock.calls[0][0];
    const parsed = JSON.parse(loggedValue);

    expect(parsed.customField).toBe('custom value');
    expect(parsed.numericField).toBe(42);
  });

  it('should output valid JSON', () => {
    log({
      level: 'info',
      endpoint: '/api/test',
      method: 'GET',
    });

    const loggedValue = vi.mocked(console.log).mock.calls[0][0];

    expect(() => JSON.parse(loggedValue)).not.toThrow();
  });
});
