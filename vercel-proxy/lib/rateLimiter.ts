import { RATE_LIMIT_CONFIG } from './constants.js';

export interface RateLimitOptions {
  /** Maximum requests per window */
  maxRequests?: number;
  /** Window duration (ms) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory Rate Limiter for Vercel Serverless
 * Note: State is per-instance, so protection is best-effort in serverless environments
 */
export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: RateLimitOptions = {}) {
    this.maxRequests = options.maxRequests ?? RATE_LIMIT_CONFIG.MAX_REQUESTS;
    this.windowMs = options.windowMs ?? RATE_LIMIT_CONFIG.WINDOW_MS;

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Check if a request is allowed for the given key (typically IP address)
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    // No existing entry or expired window
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    // Existing entry within window
    entry.count++;
    const allowed = entry.count <= this.maxRequests;
    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get current rate limit status without incrementing counter
   */
  getStatus(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetTime: now + this.windowMs,
      };
    }

    return {
      allowed: entry.count < this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Stop the cleanup interval (for testing/cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new RateLimiter();

/**
 * Extract client IP from Vercel request headers
 */
export function getClientIp(headers: Record<string, string | string[] | undefined> | undefined): string {
  if (!headers) {
    return 'unknown';
  }

  // Vercel sets x-forwarded-for header
  const forwardedFor = headers['x-forwarded-for'];
  if (forwardedFor) {
    const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    if (ip) {
      return ip.trim();
    }
  }

  // Fallback to x-real-ip
  const realIp = headers['x-real-ip'];
  if (realIp) {
    const ip = Array.isArray(realIp) ? realIp[0] : realIp;
    if (ip) {
      return ip;
    }
  }

  return 'unknown';
}
