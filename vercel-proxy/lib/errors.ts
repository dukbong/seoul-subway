export interface ApiError {
  error: string;
  errorKo: string;
  code: string;
  details?: Record<string, unknown>;
}

/**
 * Error messages in English and Korean
 */
const ErrorMessages: Record<string, { en: string; ko: string }> = {
  MISSING_PARAMETER: {
    en: 'Missing required parameter',
    ko: '필수 매개변수가 누락되었습니다',
  },
  API_KEY_NOT_CONFIGURED: {
    en: 'API key not configured',
    ko: 'API 키가 설정되지 않았습니다',
  },
  EXTERNAL_API_FAILURE: {
    en: 'Failed to fetch data from external API',
    ko: '외부 API에서 데이터를 가져오는 데 실패했습니다',
  },
  REQUEST_TIMEOUT: {
    en: 'Request timed out',
    ko: '요청 시간이 초과되었습니다',
  },
  METHOD_NOT_ALLOWED: {
    en: 'Method not allowed',
    ko: '허용되지 않는 메서드입니다',
  },
  INVALID_STATION_NAME: {
    en: 'Station not found',
    ko: '역을 찾을 수 없습니다',
  },
  RATE_LIMIT_EXCEEDED: {
    en: 'Too many requests. Please try again later.',
    ko: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  },
  CIRCUIT_OPEN: {
    en: 'Service temporarily unavailable. Please try again later.',
    ko: '서비스가 일시적으로 사용 불가합니다. 잠시 후 다시 시도해 주세요.',
  },
  VALIDATION_ERROR: {
    en: 'Invalid input',
    ko: '입력값이 올바르지 않습니다',
  },
  INVALID_PAGINATION: {
    en: 'Invalid pagination parameters',
    ko: '잘못된 페이지 매개변수입니다',
  },
  INTERNAL_ERROR: {
    en: 'Internal server error',
    ko: '내부 서버 오류가 발생했습니다',
  },
};

/**
 * Create standardized error response with bilingual messages
 * @param code - Error code from ErrorCodes
 * @param message - Optional custom English message (overrides default)
 * @param details - Additional error details
 * @param messageKo - Optional custom Korean message (overrides default)
 * @returns ApiError object
 */
export function createError(
  code: string,
  message?: string,
  details?: Record<string, unknown>,
  messageKo?: string
): ApiError {
  const defaultMessages = ErrorMessages[code] ?? { en: 'Unknown error', ko: '알 수 없는 오류가 발생했습니다' };

  return {
    error: message ?? defaultMessages.en,
    errorKo: messageKo ?? defaultMessages.ko,
    code,
    details,
  };
}

export const ErrorCodes = {
  MISSING_PARAM: 'MISSING_PARAMETER',
  API_KEY_ERROR: 'API_KEY_NOT_CONFIGURED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_FAILURE',
  TIMEOUT: 'REQUEST_TIMEOUT',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  INVALID_STATION: 'INVALID_STATION_NAME',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  CIRCUIT_OPEN: 'CIRCUIT_OPEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PAGINATION: 'INVALID_PAGINATION',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
