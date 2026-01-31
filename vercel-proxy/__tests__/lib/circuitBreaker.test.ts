import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker, CircuitOpenError } from '../../lib/circuitBreaker.js';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    vi.useFakeTimers();
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 10000,
      successThreshold: 2,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getStats().state).toBe('CLOSED');
    });

    it('should allow requests in CLOSED state', () => {
      expect(circuitBreaker.canRequest()).toBe(true);
    });
  });

  describe('failure handling', () => {
    it('should remain CLOSED with failures below threshold', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getStats().state).toBe('CLOSED');
      expect(circuitBreaker.getStats().failures).toBe(2);
    });

    it('should OPEN after reaching failure threshold', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getStats().state).toBe('OPEN');
      expect(circuitBreaker.canRequest()).toBe(false);
    });

    it('should reset failure count on success', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordSuccess();

      expect(circuitBreaker.getStats().failures).toBe(0);
    });
  });

  describe('half-open state', () => {
    it('should transition to HALF_OPEN after reset timeout', () => {
      // Open the circuit
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getStats().state).toBe('OPEN');

      // Advance time past reset timeout
      vi.advanceTimersByTime(10001);

      expect(circuitBreaker.canRequest()).toBe(true);
      expect(circuitBreaker.getStats().state).toBe('HALF_OPEN');
    });

    it('should CLOSE after success threshold in HALF_OPEN', () => {
      // Open the circuit
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      // Advance to half-open
      vi.advanceTimersByTime(10001);
      circuitBreaker.canRequest(); // trigger state check

      // Record successes
      circuitBreaker.recordSuccess();
      circuitBreaker.recordSuccess();

      expect(circuitBreaker.getStats().state).toBe('CLOSED');
    });

    it('should re-OPEN on failure in HALF_OPEN', () => {
      // Open the circuit
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      // Advance to half-open
      vi.advanceTimersByTime(10001);
      circuitBreaker.canRequest(); // trigger state check

      // Record failure
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getStats().state).toBe('OPEN');
    });
  });

  describe('execute method', () => {
    it('should execute function when circuit is CLOSED', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalled();
    });

    it('should throw CircuitOpenError when circuit is OPEN', async () => {
      // Open the circuit
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      const fn = vi.fn();

      await expect(circuitBreaker.execute(fn)).rejects.toThrow(CircuitOpenError);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should record success on successful execution', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await circuitBreaker.execute(fn);

      expect(circuitBreaker.getStats().totalRequests).toBe(1);
    });

    it('should record failure and rethrow on failed execution', async () => {
      const error = new Error('test error');
      const fn = vi.fn().mockRejectedValue(error);

      await expect(circuitBreaker.execute(fn)).rejects.toThrow('test error');
      expect(circuitBreaker.getStats().failures).toBe(1);
    });
  });

  describe('statistics', () => {
    it('should track total requests', () => {
      circuitBreaker.recordSuccess();
      circuitBreaker.recordSuccess();
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getStats().totalRequests).toBe(3);
    });

    it('should track total failures', () => {
      circuitBreaker.recordSuccess();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getStats().totalFailures).toBe(2);
    });

    it('should track last failure time', () => {
      const now = Date.now();
      circuitBreaker.recordFailure();

      const stats = circuitBreaker.getStats();
      expect(stats.lastFailureTime).toBeGreaterThanOrEqual(now);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      circuitBreaker.reset();

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe('CLOSED');
      expect(stats.failures).toBe(0);
      expect(stats.totalRequests).toBe(0);
      expect(stats.totalFailures).toBe(0);
    });
  });
});

describe('CircuitOpenError', () => {
  it('should have correct code property', () => {
    const error = new CircuitOpenError('test message');
    expect(error.code).toBe('CIRCUIT_OPEN');
    expect(error.message).toBe('test message');
    expect(error.name).toBe('CircuitOpenError');
  });
});
