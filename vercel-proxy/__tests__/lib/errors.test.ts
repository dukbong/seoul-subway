import { describe, it, expect } from 'vitest';
import { createError, ErrorCodes, type ApiError } from '../../lib/errors.js';

describe('errors', () => {
  describe('createError', () => {
    it('should create error with code and message', () => {
      const error = createError('TEST_ERROR', 'Test error message');

      expect(error).toEqual({
        error: 'Test error message',
        code: 'TEST_ERROR',
      });
    });

    it('should create error with details', () => {
      const error = createError('TEST_ERROR', 'Test error message', {
        field: 'test',
        value: 123,
      });

      expect(error).toEqual({
        error: 'Test error message',
        code: 'TEST_ERROR',
        details: {
          field: 'test',
          value: 123,
        },
      });
    });

    it('should create error with undefined details when not provided', () => {
      const error = createError('TEST_ERROR', 'Test message');

      expect(error.details).toBeUndefined();
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
  });

  describe('ApiError type', () => {
    it('should match the expected interface shape', () => {
      const error: ApiError = {
        error: 'Test message',
        code: 'TEST_CODE',
        details: { foo: 'bar' },
      };

      expect(error.error).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ foo: 'bar' });
    });
  });
});
