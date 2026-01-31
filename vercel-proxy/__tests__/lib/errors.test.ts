import { describe, it, expect } from 'vitest';
import { createError, ErrorCodes, type ApiError } from '../../lib/errors.js';

describe('errors', () => {
  describe('createError', () => {
    it('should create error with default messages from code', () => {
      const error = createError(ErrorCodes.MISSING_PARAM);

      expect(error.error).toBe('Missing required parameter');
      expect(error.errorKo).toBe('필수 매개변수가 누락되었습니다');
      expect(error.code).toBe('MISSING_PARAMETER');
    });

    it('should use custom message when provided', () => {
      const error = createError(ErrorCodes.MISSING_PARAM, 'Custom error message');

      expect(error.error).toBe('Custom error message');
      expect(error.errorKo).toBe('필수 매개변수가 누락되었습니다'); // default Korean
    });

    it('should use custom Korean message when provided', () => {
      const error = createError(
        ErrorCodes.MISSING_PARAM,
        'Custom message',
        undefined,
        '커스텀 메시지'
      );

      expect(error.error).toBe('Custom message');
      expect(error.errorKo).toBe('커스텀 메시지');
    });

    it('should create error with details', () => {
      const error = createError('TEST_ERROR', 'Test error message', {
        field: 'test',
        value: 123,
      });

      expect(error.details).toEqual({
        field: 'test',
        value: 123,
      });
    });

    it('should create error with undefined details when not provided', () => {
      const error = createError('TEST_ERROR', 'Test message');

      expect(error.details).toBeUndefined();
    });

    it('should handle unknown error codes', () => {
      const error = createError('UNKNOWN_CODE');

      expect(error.error).toBe('Unknown error');
      expect(error.errorKo).toBe('알 수 없는 오류가 발생했습니다');
      expect(error.code).toBe('UNKNOWN_CODE');
    });
  });

  describe('ErrorCodes', () => {
    it('should have MISSING_PARAM code', () => {
      expect(ErrorCodes.MISSING_PARAM).toBe('MISSING_PARAMETER');
    });

    it('should have API_KEY_ERROR code', () => {
      expect(ErrorCodes.API_KEY_ERROR).toBe('API_KEY_NOT_CONFIGURED');
    });

    it('should have EXTERNAL_API_ERROR code', () => {
      expect(ErrorCodes.EXTERNAL_API_ERROR).toBe('EXTERNAL_API_FAILURE');
    });

    it('should have TIMEOUT code', () => {
      expect(ErrorCodes.TIMEOUT).toBe('REQUEST_TIMEOUT');
    });

    it('should have METHOD_NOT_ALLOWED code', () => {
      expect(ErrorCodes.METHOD_NOT_ALLOWED).toBe('METHOD_NOT_ALLOWED');
    });

    it('should have INVALID_STATION code', () => {
      expect(ErrorCodes.INVALID_STATION).toBe('INVALID_STATION_NAME');
    });

    it('should have RATE_LIMIT code', () => {
      expect(ErrorCodes.RATE_LIMIT).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should have CIRCUIT_OPEN code', () => {
      expect(ErrorCodes.CIRCUIT_OPEN).toBe('CIRCUIT_OPEN');
    });

    it('should have VALIDATION_ERROR code', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    });

    it('should have INVALID_PAGINATION code', () => {
      expect(ErrorCodes.INVALID_PAGINATION).toBe('INVALID_PAGINATION');
    });

    it('should have INTERNAL_ERROR code', () => {
      expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });
  });

  describe('all error codes have bilingual messages', () => {
    it('should have message for API_KEY_ERROR', () => {
      const error = createError(ErrorCodes.API_KEY_ERROR);
      expect(error.error).toContain('API key');
      expect(error.errorKo).toContain('API 키');
    });

    it('should have message for EXTERNAL_API_ERROR', () => {
      const error = createError(ErrorCodes.EXTERNAL_API_ERROR);
      expect(error.error).toContain('external API');
      expect(error.errorKo).toContain('외부 API');
    });

    it('should have message for TIMEOUT', () => {
      const error = createError(ErrorCodes.TIMEOUT);
      expect(error.error.toLowerCase()).toContain('timed out');
      expect(error.errorKo).toContain('시간');
    });

    it('should have message for METHOD_NOT_ALLOWED', () => {
      const error = createError(ErrorCodes.METHOD_NOT_ALLOWED);
      expect(error.error.toLowerCase()).toContain('not allowed');
      expect(error.errorKo).toContain('허용되지 않는');
    });

    it('should have message for INVALID_STATION', () => {
      const error = createError(ErrorCodes.INVALID_STATION);
      expect(error.error.toLowerCase()).toContain('not found');
      expect(error.errorKo).toContain('찾을 수 없습니다');
    });

    it('should have message for RATE_LIMIT', () => {
      const error = createError(ErrorCodes.RATE_LIMIT);
      expect(error.error).toContain('Too many requests');
      expect(error.errorKo).toContain('요청이 너무 많습니다');
    });

    it('should have message for CIRCUIT_OPEN', () => {
      const error = createError(ErrorCodes.CIRCUIT_OPEN);
      expect(error.error).toContain('temporarily unavailable');
      expect(error.errorKo).toContain('일시적');
    });

    it('should have message for VALIDATION_ERROR', () => {
      const error = createError(ErrorCodes.VALIDATION_ERROR);
      expect(error.error).toContain('Invalid');
      expect(error.errorKo).toContain('올바르지');
    });
  });

  describe('ApiError type', () => {
    it('should match the expected interface shape with errorKo', () => {
      const error: ApiError = {
        error: 'Test message',
        errorKo: '테스트 메시지',
        code: 'TEST_CODE',
        details: { foo: 'bar' },
      };

      expect(error.error).toBe('Test message');
      expect(error.errorKo).toBe('테스트 메시지');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ foo: 'bar' });
    });
  });
});
