/**
 * API Configuration Constants
 * Central management of magic numbers and configuration values
 */

export const API_CONFIG = {
  /** Default timeout for external API requests (ms) */
  TIMEOUT: 4000,
  /** Default number of retries for failed requests */
  RETRIES: 1,
  /** Delay between retries (ms) */
  RETRY_DELAY: 1000,
} as const;

export const CACHE_CONFIG = {
  /** Realtime data cache (short-lived) */
  REALTIME: {
    s_maxage: 30,
    stale_while_revalidate: 60,
  },
  /** Route data cache (medium-lived) */
  ROUTE: {
    s_maxage: 300,
    stale_while_revalidate: 600,
  },
  /** Station data cache (long-lived) */
  STATIONS: {
    s_maxage: 3600,
    stale_while_revalidate: 7200,
  },
  /** Alerts cache (medium-lived) */
  ALERTS: {
    s_maxage: 300,
    stale_while_revalidate: 600,
  },
} as const;

export const VALIDATION_CONFIG = {
  /** Maximum station name length */
  MAX_STATION_NAME_LENGTH: 50,
  /** Minimum station name length */
  MIN_STATION_NAME_LENGTH: 1,
  /** Allowed characters pattern: Korean, English, numbers, spaces, hyphens, dots, parentheses */
  ALLOWED_CHARS_PATTERN: /^[\uAC00-\uD7AF\u1100-\u11FFa-zA-Z0-9\s\-_.()]+$/,
} as const;

export const RATE_LIMIT_CONFIG = {
  /** Maximum requests per window */
  MAX_REQUESTS: 100,
  /** Window duration (ms) - 1 minute */
  WINDOW_MS: 60 * 1000,
} as const;

export const CIRCUIT_BREAKER_CONFIG = {
  /** Number of failures before opening circuit */
  FAILURE_THRESHOLD: 5,
  /** Time to wait before half-open state (ms) */
  RESET_TIMEOUT: 30 * 1000,
  /** Number of successful requests to close circuit */
  SUCCESS_THRESHOLD: 2,
} as const;

export const MATCHER_CONFIG = {
  /** Maximum cache size for normalize function */
  NORMALIZE_CACHE_SIZE: 500,
  /** Maximum cache size for matchStation results */
  MATCH_CACHE_SIZE: 1000,
  /** Maximum Levenshtein distance for fuzzy matching in matchStation */
  FUZZY_MATCH_THRESHOLD: 1,
  /** Maximum Levenshtein distance for suggestions */
  SUGGESTION_THRESHOLD: 3,
  /** Default number of suggestions */
  DEFAULT_SUGGESTION_LIMIT: 3,
} as const;

export const LOG_CONFIG = {
  /** Sensitive keys to mask in logs */
  SENSITIVE_KEYS: ['serviceKey', 'apikey', 'apiKey', 'key', 'token', 'password', 'secret'],
  /** Mask replacement string */
  MASK_STRING: '***MASKED***',
} as const;

/**
 * Generate Cache-Control header value from config
 */
export function getCacheControlHeader(config: { s_maxage: number; stale_while_revalidate: number }): string {
  return `s-maxage=${config.s_maxage}, stale-while-revalidate=${config.stale_while_revalidate}`;
}
