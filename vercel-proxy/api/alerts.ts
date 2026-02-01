import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../lib/errors.js';
import { log } from '../lib/logger.js';
import { getCircuitBreaker, CircuitOpenError } from '../lib/circuitBreaker.js';
import { globalRateLimiter, getClientIp } from '../lib/rateLimiter.js';
import { validateLineName, validatePagination } from '../lib/validation.js';
import type { AlertsApiResponse } from '../lib/types/index.js';

export interface AlertsOptions {
  pageNo?: string;
  numOfRows?: string;
  lineNm?: string;
}

/**
 * Fetch service alerts data (testable core logic)
 */
export async function getAlertsData(
  apiKey: string,
  options: AlertsOptions = {}
): Promise<AlertsApiResponse> {
  const { pageNo = '1', numOfRows = '10', lineNm } = options;

  const params = new URLSearchParams({
    serviceKey: apiKey,
    dataType: 'JSON',
    pageNo,
    numOfRows,
  });

  if (lineNm) {
    params.append('lineNm', lineNm);
  }

  const apiUrl = `https://apis.data.go.kr/B553766/ntce/getNtceList?${params.toString()}`;

  const response = await fetchWithRetry(apiUrl, { timeout: 4000, retries: 1 });
  return response.json() as Promise<AlertsApiResponse>;
}

/**
 * Service alerts proxy
 *
 * Original API: https://apis.data.go.kr/B553766/ntce/getNtceList
 * Proxy API: /api/alerts?pageNo=1&numOfRows=10&lineNm=2호선
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

  const { pageNo, numOfRows, lineNm } = req.query;

  // Validate pagination
  const paginationResult = validatePagination(pageNo, numOfRows, { start: '1', end: '10' });
  if (!paginationResult.valid) {
    return res.status(400).json(
      createError(ErrorCodes.INVALID_PAGINATION, paginationResult.error, undefined, paginationResult.errorKo)
    );
  }

  // Validate line name if provided
  const lineValidation = validateLineName(lineNm);
  if (!lineValidation.valid) {
    return res.status(400).json(
      createError(ErrorCodes.VALIDATION_ERROR, lineValidation.error, { param: 'lineNm' }, lineValidation.errorKo)
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
      getAlertsData(apiKey, {
        pageNo: paginationResult.start,
        numOfRows: paginationResult.end,
        lineNm: lineValidation.sanitized,
      })
    );

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    log({
      level: 'info',
      endpoint: '/api/alerts',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    return res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/alerts',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    if (error instanceof CircuitOpenError) {
      return res.status(503).json(createError(ErrorCodes.CIRCUIT_OPEN));
    }

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch alerts')
    );
  }
}
