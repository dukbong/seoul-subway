import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RATE_LIMIT_CONFIG } from './constants.js';

export interface RateLimitOptions {
  /** Maximum requests per window */
  maxRequests?: number;
  /** Window duration in milliseconds */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limiter using sliding window algorithm
 * Note: In serverless environment, this is per-instance. For distributed rate limiting,
 * consider using Redis or similar external store.
 */
class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(options: RateLimitOptions = {}) {
    this.maxRequests = options.maxRequests ?? RATE_LIMIT_CONFIG.MAX_REQUESTS;
    this.windowMs = options.windowMs ?? RATE_LIMIT_CONFIG.WINDOW_MS;
  }

  /**
   * Check if a request is allowed and update the counter
   * @param key - Unique identifier (usually IP address)
   * @returns Rate limit result
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    this.cleanup(now);

    const entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      // New window
      const resetTime = now + this.windowMs;
      this.store.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: Math.ceil(resetTime / 1000),
      };
    }

    // Existing window
    entry.count++;
    const allowed = entry.count <= this.maxRequests;

    return {
      allowed,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      reset: Math.ceil(entry.resetTime / 1000),
    };
  }

  /**
   * Get current rate limit status without incrementing counter
   * @param key - Unique identifier
   * @returns Current rate limit status
   */
  getStatus(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        reset: Math.ceil((now + this.windowMs) / 1000),
      };
    }

    return {
      allowed: entry.count < this.maxRequests,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      reset: Math.ceil(entry.resetTime / 1000),
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(now: number): void {
    // Only cleanup periodically (every 100 checks)
    if (this.store.size > 0 && Math.random() < 0.01) {
      for (const [key, entry] of this.store.entries()) {
        if (now >= entry.resetTime) {
          this.store.delete(key);
        }
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Get client IP address from request
 */
export function getClientIp(req: VercelRequest): string {
  // Check various headers for the real IP
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for may contain multiple IPs, take the first one
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip?.trim() ?? 'unknown';
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? (realIp[0] ?? 'unknown') : realIp;
  }

  // Fallback to unknown
  return 'unknown';
}

/**
 * Apply rate limit headers to response
 */
export function setRateLimitHeaders(res: VercelResponse, result: RateLimitResult): void {
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.reset);
}

/**
 * Check rate limit and apply headers
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(req: VercelRequest, res: VercelResponse): boolean {
  const ip = getClientIp(req);
  const result = rateLimiter.check(ip);
  setRateLimitHeaders(res, result);
  return result.allowed;
}

/**
 * Create rate limit error response
 */
export function createRateLimitError(): {
  error: string;
  errorKo: string;
  code: string;
} {
  return {
    error: 'Too many requests. Please try again later.',
    errorKo: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    code: 'RATE_LIMIT_EXCEEDED',
  };
}

/**
 * Export for testing purposes
 */
export { rateLimiter, RateLimiter };
