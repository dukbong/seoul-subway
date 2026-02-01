import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations } from '../../lib/stationMatcher.js';
import { getCircuitBreaker, CircuitOpenError } from '../../lib/circuitBreaker.js';
import { globalRateLimiter, getClientIp } from '../../lib/rateLimiter.js';
import { validateStationName, validatePagination } from '../../lib/validation.js';
import type { RealtimeApiResponse } from '../../lib/types/index.js';

export interface RealtimeOptions {
  start?: string;
  end?: string;
}

/**
 * Fetch real-time arrival data for a station (testable core logic)
 */
export async function getRealtimeData(
  station: string,
  apiKey: string,
  options: RealtimeOptions = {}
): Promise<RealtimeApiResponse> {
  const { start = '0', end = '10' } = options;
  const encodedStation = encodeURIComponent(station);
  const apiUrl = `http://swopenAPI.seoul.go.kr/api/subway/${apiKey}/json/realtimeStationArrival/${start}/${end}/${encodedStation}`;

  const response = await fetchWithRetry(apiUrl, { timeout: 4000, retries: 1 });
  return response.json() as Promise<RealtimeApiResponse>;
}

/**
 * Real-time subway arrival information proxy
 *
 * Original API: http://swopenAPI.seoul.go.kr/api/subway/{KEY}/json/realtimeStationArrival/{start}/{end}/{station}
 * Proxy API: /api/realtime/{station}?start=0&end=10
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json(createError(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed'));
  }

  // Rate limiting
  const clientIp = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  const rateLimitResult = globalRateLimiter.check(clientIp);
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  res.setHeader('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

  if (!rateLimitResult.allowed) {
    return res.status(429).json(createError(ErrorCodes.RATE_LIMIT));
  }

  // Validate station parameter
  const { station } = req.query;
  const stationValidation = validateStationName(station);
  if (!stationValidation.valid) {
    return res.status(400).json(
      createError(ErrorCodes.VALIDATION_ERROR, stationValidation.error, undefined, stationValidation.errorKo)
    );
  }

  // Validate pagination parameters
  const paginationResult = validatePagination(req.query.start, req.query.end, { start: '0', end: '10' });
  if (!paginationResult.valid) {
    return res.status(400).json(
      createError(ErrorCodes.INVALID_PAGINATION, paginationResult.error, undefined, paginationResult.errorKo)
    );
  }

  // Normalize station name (supports English input, case-insensitive)
  const normalizedStation = matchStation(stationValidation.sanitized!);
  if (!normalizedStation) {
    const suggestions = suggestStations(stationValidation.sanitized!);
    return res.status(400).json(
      createError(ErrorCodes.INVALID_STATION, 'Station not found', {
        input: station,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        hint: 'Try Korean name directly or check spelling',
      })
    );
  }

  const apiKey = process.env.SEOUL_OPENAPI_KEY;
  if (!apiKey) {
    return res.status(500).json(createError(ErrorCodes.API_KEY_ERROR, 'API key not configured'));
  }

  // Circuit breaker protection
  const circuitBreaker = getCircuitBreaker('seoulOpenApi');

  try {
    const data = await circuitBreaker.execute(() =>
      getRealtimeData(normalizedStation, apiKey, {
        start: paginationResult.start,
        end: paginationResult.end,
      })
    );

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    log({
      level: 'info',
      endpoint: '/api/realtime',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    return res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/realtime',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    if (error instanceof CircuitOpenError) {
      return res.status(503).json(createError(ErrorCodes.CIRCUIT_OPEN));
    }

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch realtime data')
    );
  }
}
