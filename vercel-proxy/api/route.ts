import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../lib/errors.js';
import { log } from '../lib/logger.js';
import { matchStation, suggestStations } from '../lib/stationMatcher.js';
import { getCircuitBreaker, CircuitOpenError } from '../lib/circuitBreaker.js';
import { globalRateLimiter, getClientIp } from '../lib/rateLimiter.js';
import { validateStationName } from '../lib/validation.js';
import type { RouteApiResponse } from '../lib/types/index.js';

export interface RouteOptions {
  dptreStnNm: string;
  arvlStnNm: string;
  searchDt?: string;
  searchType?: string;
}

/**
 * Get current time in Korea Standard Time (UTC+9) formatted as 'YYYY-MM-DD HH:mm:ss'
 */
export function getKSTDateTime(): string {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return koreaTime.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Fetch route data between two stations (testable core logic)
 */
export async function getRouteData(
  apiKey: string,
  options: RouteOptions
): Promise<RouteApiResponse> {
  const { dptreStnNm, arvlStnNm, searchDt, searchType } = options;

  const params = new URLSearchParams({
    serviceKey: apiKey,
    dataType: 'JSON',
    dptreStnNm,
    arvlStnNm,
    searchDt: searchDt || getKSTDateTime(),
  });

  if (searchType) {
    params.append('searchType', searchType);
  }

  const apiUrl = `https://apis.data.go.kr/B553766/path/getShtrmPath?${params.toString()}`;

  const response = await fetchWithRetry(apiUrl, { timeout: 4000, retries: 1 });
  return response.json() as Promise<RouteApiResponse>;
}

/**
 * Route search proxy
 *
 * Original API: https://apis.data.go.kr/B553766/path/getShtrmPath
 * Proxy API: /api/route?dptreStnNm=신도림&arvlStnNm=서울역&searchDt=2024-01-01%2012:00:00
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

  const { dptreStnNm, arvlStnNm, searchDt, searchType } = req.query;

  // Validate departure station
  const departureValidation = validateStationName(dptreStnNm);
  if (!departureValidation.valid) {
    return res.status(400).json(
      createError(ErrorCodes.VALIDATION_ERROR, departureValidation.error, { param: 'dptreStnNm' }, departureValidation.errorKo)
    );
  }

  // Validate arrival station
  const arrivalValidation = validateStationName(arvlStnNm);
  if (!arrivalValidation.valid) {
    return res.status(400).json(
      createError(ErrorCodes.VALIDATION_ERROR, arrivalValidation.error, { param: 'arvlStnNm' }, arrivalValidation.errorKo)
    );
  }

  // Normalize departure station name
  const normalizedDeparture = matchStation(departureValidation.sanitized!);
  if (!normalizedDeparture) {
    const suggestions = suggestStations(departureValidation.sanitized!);
    return res.status(400).json(
      createError(ErrorCodes.INVALID_STATION, 'Departure station not found', {
        input: dptreStnNm,
        param: 'dptreStnNm',
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        hint: 'Try Korean name directly or check spelling',
      })
    );
  }

  // Normalize arrival station name
  const normalizedArrival = matchStation(arrivalValidation.sanitized!);
  if (!normalizedArrival) {
    const suggestions = suggestStations(arrivalValidation.sanitized!);
    return res.status(400).json(
      createError(ErrorCodes.INVALID_STATION, 'Arrival station not found', {
        input: arvlStnNm,
        param: 'arvlStnNm',
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        hint: 'Try Korean name directly or check spelling',
      })
    );
  }

  const apiKey = process.env.DATA_GO_KR_KEY;
  if (!apiKey) {
    return res.status(500).json(createError(ErrorCodes.API_KEY_ERROR, 'API key not configured'));
  }

  // Circuit breaker protection
  const circuitBreaker = getCircuitBreaker('dataGoKr');

  try {
    const data = await circuitBreaker.execute(() =>
      getRouteData(apiKey, {
        dptreStnNm: normalizedDeparture,
        arvlStnNm: normalizedArrival,
        searchDt: searchDt ? String(searchDt) : undefined,
        searchType: searchType ? String(searchType) : undefined,
      })
    );

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    log({
      level: 'info',
      endpoint: '/api/route',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    return res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/route',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    if (error instanceof CircuitOpenError) {
      return res.status(503).json(createError(ErrorCodes.CIRCUIT_OPEN));
    }

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch route data')
    );
  }
}
