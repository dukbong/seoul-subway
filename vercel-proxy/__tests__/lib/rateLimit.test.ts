import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter, getClientIp, createRateLimitError } from '../../lib/rateLimit.js';
import type { VercelRequest } from '@vercel/node';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    rateLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 60000, // 1 minute
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('check', () => {
    it('should allow first request', () => {
      const result = rateLimiter.check('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(4);
    });

    it('should decrement remaining on each request', () => {
      rateLimiter.check('192.168.1.1');
      rateLimiter.check('192.168.1.1');
      const result = rateLimiter.check('192.168.1.1');

      expect(result.remaining).toBe(2);
    });

    it('should block after limit exceeded', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('192.168.1.1');
      }

      const result = rateLimiter.check('192.168.1.1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track different IPs separately', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('192.168.1.1');
      }

      const result1 = rateLimiter.check('192.168.1.1');
      const result2 = rateLimiter.check('192.168.1.2');

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(4);
    });

    it('should reset after window expires', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('192.168.1.1');
      }

      expect(rateLimiter.check('192.168.1.1').allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(60001);

      const result = rateLimiter.check('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should return reset timestamp', () => {
      const now = Date.now();
      const result = rateLimiter.check('192.168.1.1');

      // Reset should be approximately now + windowMs
      expect(result.reset).toBeGreaterThan(Math.floor(now / 1000));
      expect(result.reset).toBeLessThanOrEqual(Math.ceil((now + 60000) / 1000));
    });
  });

  describe('getStatus', () => {
    it('should return current status without incrementing counter', () => {
      rateLimiter.check('192.168.1.1');

      const status1 = rateLimiter.getStatus('192.168.1.1');
      const status2 = rateLimiter.getStatus('192.168.1.1');

      expect(status1.remaining).toBe(4);
      expect(status2.remaining).toBe(4); // Should not decrement
    });

    it('should return full limit for unknown IP', () => {
      const status = rateLimiter.getStatus('unknown-ip');

      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(5);
    });
  });

  describe('reset', () => {
    it('should reset rate limit for specific IP', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('192.168.1.1');
      }

      expect(rateLimiter.check('192.168.1.1').allowed).toBe(false);

      rateLimiter.reset('192.168.1.1');

      const result = rateLimiter.check('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });

  describe('clear', () => {
    it('should clear all rate limits', () => {
      rateLimiter.check('192.168.1.1');
      rateLimiter.check('192.168.1.2');

      rateLimiter.clear();

      expect(rateLimiter.getStatus('192.168.1.1').remaining).toBe(5);
      expect(rateLimiter.getStatus('192.168.1.2').remaining).toBe(5);
    });
  });
});

describe('getClientIp', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const req = {
      headers: {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
      },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('203.0.113.195');
  });

  it('should handle single IP in x-forwarded-for', () => {
    const req = {
      headers: {
        'x-forwarded-for': '203.0.113.195',
      },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('203.0.113.195');
  });

  it('should handle array x-forwarded-for header', () => {
    const req = {
      headers: {
        'x-forwarded-for': ['203.0.113.195'],
      },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('203.0.113.195');
  });

  it('should fallback to x-real-ip', () => {
    const req = {
      headers: {
        'x-real-ip': '192.168.1.1',
      },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('192.168.1.1');
  });

  it('should return unknown when no IP headers present', () => {
    const req = {
      headers: {},
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('unknown');
  });
});

describe('createRateLimitError', () => {
  it('should return error object with bilingual messages', () => {
    const error = createRateLimitError();

    expect(error.error).toContain('Too many requests');
    expect(error.errorKo).toContain('요청이 너무 많습니다');
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
