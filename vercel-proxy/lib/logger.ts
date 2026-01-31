import { LOG_CONFIG } from './constants.js';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  endpoint: string;
  method: string;
  duration?: number;
  status?: number;
  error?: string;
  [key: string]: unknown;
}

/**
 * Mask sensitive information in a string
 * Detects and masks API keys, tokens, and other sensitive values
 */
function maskSensitiveString(value: string): string {
  let masked = value;

  // Mask URL query parameters containing sensitive keys
  for (const key of LOG_CONFIG.SENSITIVE_KEYS) {
    // Match key=value in query strings (case-insensitive)
    const queryParamRegex = new RegExp(`(${key}=)([^&\\s]+)`, 'gi');
    masked = masked.replace(queryParamRegex, `$1${LOG_CONFIG.MASK_STRING}`);

    // Match key: value or "key": "value" in JSON-like strings
    const jsonRegex = new RegExp(`("${key}"\\s*:\\s*")([^"]+)(")`, 'gi');
    masked = masked.replace(jsonRegex, `$1${LOG_CONFIG.MASK_STRING}$3`);
  }

  return masked;
}

/**
 * Deep mask sensitive information in an object
 */
function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return maskSensitiveString(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }

  if (typeof data === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if the key itself is sensitive
      if (LOG_CONFIG.SENSITIVE_KEYS.some(sensitiveKey =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      )) {
        masked[key] = LOG_CONFIG.MASK_STRING;
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}

export function log(entry: Omit<LogEntry, 'timestamp'>): void {
  // Mask sensitive information before logging
  const maskedEntry = maskSensitiveData(entry) as Omit<LogEntry, 'timestamp'>;

  const logEntry = {
    timestamp: new Date().toISOString(),
    ...maskedEntry,
  } as LogEntry;

  const output = JSON.stringify(logEntry);

  if (entry.level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}

/**
 * Export for testing purposes
 */
export { maskSensitiveString, maskSensitiveData };
