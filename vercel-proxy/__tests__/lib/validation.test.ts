import { describe, it, expect } from 'vitest';
import { validateStationName, validatePagination, validateLineName } from '../../lib/validation.js';

describe('validateStationName', () => {
  it('should accept valid Korean station name', () => {
    const result = validateStationName('강남');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('강남');
  });

  it('should accept valid English station name', () => {
    const result = validateStationName('Gangnam');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Gangnam');
  });

  it('should accept station name with spaces', () => {
    const result = validateStationName('Seoul Station');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Seoul Station');
  });

  it('should accept station name with hyphens and parentheses', () => {
    const result = validateStationName('Hongdae (Hongik Univ.)');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Hongdae (Hongik Univ.)');
  });

  it('should trim whitespace', () => {
    const result = validateStationName('  강남  ');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('강남');
  });

  it('should reject null input', () => {
    const result = validateStationName(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
    expect(result.errorKo).toContain('필요');
  });

  it('should reject undefined input', () => {
    const result = validateStationName(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject non-string input', () => {
    const result = validateStationName(123);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('string');
    expect(result.errorKo).toContain('문자열');
  });

  it('should reject empty string', () => {
    const result = validateStationName('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
    expect(result.errorKo).toContain('비어');
  });

  it('should reject whitespace-only string', () => {
    const result = validateStationName('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject too long station name', () => {
    const longName = 'a'.repeat(51);
    const result = validateStationName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('50');
    expect(result.errorKo).toContain('50');
  });

  it('should reject station name with invalid characters', () => {
    const result = validateStationName('강남<script>');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid characters');
    expect(result.errorKo).toContain('허용되지 않는');
  });

  it('should reject SQL injection attempts', () => {
    const result = validateStationName("'; DROP TABLE--");
    expect(result.valid).toBe(false);
  });
});

describe('validatePagination', () => {
  it('should use defaults when not provided', () => {
    const result = validatePagination(undefined, undefined);
    expect(result.valid).toBe(true);
    expect(result.start).toBe('0');
    expect(result.end).toBe('10');
  });

  it('should accept valid numeric strings', () => {
    const result = validatePagination('5', '15');
    expect(result.valid).toBe(true);
    expect(result.start).toBe('5');
    expect(result.end).toBe('15');
  });

  it('should accept numbers', () => {
    const result = validatePagination(5, 15);
    expect(result.valid).toBe(true);
    expect(result.start).toBe('5');
    expect(result.end).toBe('15');
  });

  it('should reject invalid start', () => {
    const result = validatePagination('abc', '10');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('valid numbers');
    expect(result.errorKo).toContain('유효한 숫자');
  });

  it('should reject negative values', () => {
    const result = validatePagination('-1', '10');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('negative');
    expect(result.errorKo).toContain('음수');
  });

  it('should reject start > end', () => {
    const result = validatePagination('10', '5');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('greater');
    expect(result.errorKo).toContain('클 수 없습니다');
  });

  it('should use custom defaults', () => {
    const result = validatePagination(undefined, undefined, { start: '1', end: '20' });
    expect(result.start).toBe('1');
    expect(result.end).toBe('20');
  });
});

describe('validateLineName', () => {
  it('should accept null (optional field)', () => {
    const result = validateLineName(null);
    expect(result.valid).toBe(true);
  });

  it('should accept undefined (optional field)', () => {
    const result = validateLineName(undefined);
    expect(result.valid).toBe(true);
  });

  it('should accept valid line name', () => {
    const result = validateLineName('2호선');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('2호선');
  });

  it('should accept empty string as not provided', () => {
    const result = validateLineName('');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBeUndefined();
  });

  it('should reject non-string input', () => {
    const result = validateLineName(123);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('string');
  });

  it('should reject too long line name', () => {
    const longName = 'a'.repeat(21);
    const result = validateLineName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
    expect(result.errorKo).toContain('너무 깁니다');
  });

  it('should trim whitespace', () => {
    const result = validateLineName('  2호선  ');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('2호선');
  });
});
