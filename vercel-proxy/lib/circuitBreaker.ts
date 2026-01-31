import { CIRCUIT_BREAKER_CONFIG } from './constants.js';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold?: number;
  /** Time to wait before attempting reset (ms) */
  resetTimeout?: number;
  /** Number of successful requests needed to close circuit from half-open */
  successThreshold?: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  totalRequests: number;
  totalFailures: number;
}

/**
 * Circuit Breaker implementation for external API calls
 * Prevents cascading failures by temporarily blocking requests when the downstream service is failing
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number | null = null;
  private totalRequests = 0;
  private totalFailures = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly successThreshold: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD;
    this.resetTimeout = options.resetTimeout ?? CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT;
    this.successThreshold = options.successThreshold ?? CIRCUIT_BREAKER_CONFIG.SUCCESS_THRESHOLD;
  }

  /**
   * Check if requests are allowed through the circuit
   */
  canRequest(): boolean {
    this.updateState();
    return this.state !== 'OPEN';
  }

  /**
   * Record a successful request
   */
  recordSuccess(): void {
    this.totalRequests++;

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.close();
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success in closed state
      this.failures = 0;
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(): void {
    this.totalRequests++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Any failure in half-open state opens the circuit
      this.open();
    } else if (this.state === 'CLOSED') {
      this.failures++;
      if (this.failures >= this.failureThreshold) {
        this.open();
      }
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    this.updateState();
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
    };
  }

  /**
   * Force reset the circuit breaker to closed state
   */
  reset(): void {
    this.close();
    this.totalRequests = 0;
    this.totalFailures = 0;
  }

  /**
   * Execute a function with circuit breaker protection
   * @param fn - Async function to execute
   * @returns Result of the function
   * @throws CircuitOpenError if circuit is open, or the original error if function fails
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canRequest()) {
      throw new CircuitOpenError('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private updateState(): void {
    if (this.state === 'OPEN' && this.lastFailureTime !== null) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure >= this.resetTimeout) {
        this.halfOpen();
      }
    }
  }

  private open(): void {
    this.state = 'OPEN';
    this.successes = 0;
  }

  private halfOpen(): void {
    this.state = 'HALF_OPEN';
    this.successes = 0;
    this.failures = 0;
  }

  private close(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
  }
}

/**
 * Error thrown when circuit breaker is open
 */
export class CircuitOpenError extends Error {
  readonly code = 'CIRCUIT_OPEN';

  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

/**
 * Global circuit breakers for each external API
 */
export const circuitBreakers = {
  seoulOpenApi: new CircuitBreaker(),
  dataGoKr: new CircuitBreaker(),
} as const;

/**
 * Get circuit breaker for a specific API
 */
export function getCircuitBreaker(apiName: keyof typeof circuitBreakers): CircuitBreaker {
  return circuitBreakers[apiName];
}
