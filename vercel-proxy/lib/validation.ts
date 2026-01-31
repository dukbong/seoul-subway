import { VALIDATION_CONFIG } from './constants.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorKo?: string;
  sanitized?: string;
}

/**
 * Validate station name input
 * @param input - Station name to validate
 * @returns Validation result with sanitized value if valid
 */
export function validateStationName(input: unknown): ValidationResult {
  // Check for null/undefined
  if (input === null || input === undefined) {
    return {
      valid: false,
      error: 'Station name is required',
      errorKo: '역 이름이 필요합니다',
    };
  }

  // Check for non-string types
  if (typeof input !== 'string') {
    return {
      valid: false,
      error: 'Station name must be a string',
      errorKo: '역 이름은 문자열이어야 합니다',
    };
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Check for empty string
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Station name cannot be empty',
      errorKo: '역 이름은 비어 있을 수 없습니다',
    };
  }

  // Check minimum length
  if (trimmed.length < VALIDATION_CONFIG.MIN_STATION_NAME_LENGTH) {
    return {
      valid: false,
      error: `Station name must be at least ${VALIDATION_CONFIG.MIN_STATION_NAME_LENGTH} character(s)`,
      errorKo: `역 이름은 최소 ${VALIDATION_CONFIG.MIN_STATION_NAME_LENGTH}자 이상이어야 합니다`,
    };
  }

  // Check maximum length
  if (trimmed.length > VALIDATION_CONFIG.MAX_STATION_NAME_LENGTH) {
    return {
      valid: false,
      error: `Station name must be at most ${VALIDATION_CONFIG.MAX_STATION_NAME_LENGTH} characters`,
      errorKo: `역 이름은 최대 ${VALIDATION_CONFIG.MAX_STATION_NAME_LENGTH}자까지 가능합니다`,
    };
  }

  // Check allowed characters
  if (!VALIDATION_CONFIG.ALLOWED_CHARS_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: 'Station name contains invalid characters',
      errorKo: '역 이름에 허용되지 않는 문자가 포함되어 있습니다',
    };
  }

  return {
    valid: true,
    sanitized: trimmed,
  };
}

/**
 * Validate pagination parameters
 * @param start - Start index (string or number)
 * @param end - End index (string or number)
 * @param defaults - Default values if not provided
 * @returns Validated and normalized pagination values
 */
export function validatePagination(
  start: unknown,
  end: unknown,
  defaults: { start: string; end: string } = { start: '0', end: '10' }
): { start: string; end: string; valid: boolean; error?: string; errorKo?: string } {
  const startNum = start !== undefined && start !== null ? parseInt(String(start), 10) : parseInt(defaults.start, 10);
  const endNum = end !== undefined && end !== null ? parseInt(String(end), 10) : parseInt(defaults.end, 10);

  if (isNaN(startNum) || isNaN(endNum)) {
    return {
      start: defaults.start,
      end: defaults.end,
      valid: false,
      error: 'Pagination parameters must be valid numbers',
      errorKo: '페이지 매개변수는 유효한 숫자여야 합니다',
    };
  }

  if (startNum < 0 || endNum < 0) {
    return {
      start: defaults.start,
      end: defaults.end,
      valid: false,
      error: 'Pagination parameters cannot be negative',
      errorKo: '페이지 매개변수는 음수가 될 수 없습니다',
    };
  }

  if (startNum > endNum) {
    return {
      start: defaults.start,
      end: defaults.end,
      valid: false,
      error: 'Start index cannot be greater than end index',
      errorKo: '시작 인덱스가 끝 인덱스보다 클 수 없습니다',
    };
  }

  return {
    start: String(startNum),
    end: String(endNum),
    valid: true,
  };
}

/**
 * Validate line name input (for alerts API)
 * @param input - Line name to validate
 * @returns Validation result with sanitized value if valid
 */
export function validateLineName(input: unknown): ValidationResult {
  if (input === null || input === undefined) {
    // Line name is optional
    return { valid: true };
  }

  if (typeof input !== 'string') {
    return {
      valid: false,
      error: 'Line name must be a string',
      errorKo: '호선 이름은 문자열이어야 합니다',
    };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    // Empty string treated as not provided
    return { valid: true };
  }

  if (trimmed.length > 20) {
    return {
      valid: false,
      error: 'Line name is too long',
      errorKo: '호선 이름이 너무 깁니다',
    };
  }

  return {
    valid: true,
    sanitized: trimmed,
  };
}
