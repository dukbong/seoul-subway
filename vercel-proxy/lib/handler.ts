import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createError, ErrorCodes } from './errors.js';
import { log } from './logger.js';
import { checkRateLimit, createRateLimitError } from './rateLimit.js';
import { CircuitBreaker, CircuitOpenError } from './circuitBreaker.js';
import { getCacheControlHeader } from './constants.js';

export interface HandlerConfig {
  /** Endpoint name for logging (e.g., '/api/realtime') */
  endpoint: string;
  /** Allowed HTTP methods (default: ['GET']) */
  methods?: string[];
  /** Cache configuration */
  cache?: {
    s_maxage: number;
    stale_while_revalidate: number;
  };
  /** Circuit breaker instance (optional) */
  circuitBreaker?: CircuitBreaker;
  /** Enable rate limiting (default: true) */
  rateLimit?: boolean;
}

export type HandlerFunction = (
  req: VercelRequest,
  res: VercelResponse
) => Promise<void>;

/**
 * Create a standardized API handler with common middleware
 * Includes: CORS, method validation, rate limiting, circuit breaker, logging, error handling
 *
 * @param config - Handler configuration
 * @param handler - The actual handler function
 * @returns Wrapped handler function
 */
export function createHandler(
  config: HandlerConfig,
  handler: HandlerFunction
): HandlerFunction {
  const {
    endpoint,
    methods = ['GET'],
    cache,
    circuitBreaker,
    rateLimit = true,
  } = config;

  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    const startTime = Date.now();

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Method validation
    if (!methods.includes(req.method ?? '')) {
      res.status(405).json(createError(ErrorCodes.METHOD_NOT_ALLOWED));
      return;
    }

    // Rate limiting
    if (rateLimit && !checkRateLimit(req, res)) {
      log({
        level: 'warn',
        endpoint,
        method: req.method ?? 'UNKNOWN',
        duration: Date.now() - startTime,
        status: 429,
        rateLimited: true,
      });
      res.status(429).json(createRateLimitError());
      return;
    }

    // Circuit breaker check
    if (circuitBreaker && !circuitBreaker.canRequest()) {
      log({
        level: 'warn',
        endpoint,
        method: req.method ?? 'UNKNOWN',
        duration: Date.now() - startTime,
        status: 503,
        circuitOpen: true,
      });
      res.status(503).json(createError(ErrorCodes.CIRCUIT_OPEN));
      return;
    }

    try {
      // Set cache headers if configured
      if (cache) {
        res.setHeader('Cache-Control', getCacheControlHeader(cache));
      }

      // Execute the actual handler
      await handler(req, res);

      // Record success for circuit breaker
      if (circuitBreaker) {
        circuitBreaker.recordSuccess();
      }

      // Log successful request (only if response wasn't already sent with error)
      if (!res.headersSent || res.statusCode < 400) {
        log({
          level: 'info',
          endpoint,
          method: req.method ?? 'UNKNOWN',
          duration: Date.now() - startTime,
          status: res.statusCode || 200,
        });
      }
    } catch (error) {
      // Record failure for circuit breaker
      if (circuitBreaker) {
        circuitBreaker.recordFailure();
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isCircuitOpen = error instanceof CircuitOpenError;

      log({
        level: 'error',
        endpoint,
        method: req.method ?? 'UNKNOWN',
        duration: Date.now() - startTime,
        error: errorMessage,
        circuitOpen: isCircuitOpen,
      });

      // Don't send response if already sent
      if (res.headersSent) {
        return;
      }

      if (isCircuitOpen) {
        res.status(503).json(createError(ErrorCodes.CIRCUIT_OPEN));
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        res.status(504).json(createError(ErrorCodes.TIMEOUT));
      } else {
        res.status(500).json(createError(ErrorCodes.EXTERNAL_API_ERROR));
      }
    }
  };
}

/**
 * Helper to send JSON response with status code
 */
export function sendJson(res: VercelResponse, status: number, data: unknown): void {
  res.status(status).json(data);
}

/**
 * Helper to send error response
 */
export function sendError(
  res: VercelResponse,
  status: number,
  code: string,
  message?: string,
  details?: Record<string, unknown>
): void {
  res.status(status).json(createError(code, message, details));
}
