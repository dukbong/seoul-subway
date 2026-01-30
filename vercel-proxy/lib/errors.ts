export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export function createError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return { error: message, code, details };
}

export const ErrorCodes = {
  MISSING_PARAM: 'MISSING_PARAMETER',
  API_KEY_ERROR: 'API_KEY_NOT_CONFIGURED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_FAILURE',
  TIMEOUT: 'REQUEST_TIMEOUT',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
} as const;
