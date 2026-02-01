import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../lib/errors.js';
import { log } from '../lib/logger.js';
import { matchStation, suggestStations } from '../lib/stationMatcher.js';
import type { RouteApiResponse } from '../lib/types/index.js';
import { formatRoute } from '../lib/routeFormatter.js';
import type { Language } from '../lib/formatter.js';

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

  const { dptreStnNm, arvlStnNm, searchDt, searchType } = req.query;

  if (!dptreStnNm || !arvlStnNm) {
    return res.status(400).json(
      createError(ErrorCodes.MISSING_PARAM, 'Missing required parameters', {
        required: ['dptreStnNm', 'arvlStnNm'],
        optional: ['searchDt', 'searchType'],
      })
    );
  }

  // Normalize departure station name
  const normalizedDeparture = matchStation(String(dptreStnNm));
  if (!normalizedDeparture) {
    const suggestions = suggestStations(String(dptreStnNm));
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
  const normalizedArrival = matchStation(String(arvlStnNm));
  if (!normalizedArrival) {
    const suggestions = suggestStations(String(arvlStnNm));
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

  // Parse format and lang parameters
  const format = (req.query.format as string) || 'formatted';
  const lang: Language = (req.query.lang as Language) === 'en' ? 'en' : 'ko';

  try {
    const data = await getRouteData(apiKey, {
      dptreStnNm: normalizedDeparture,
      arvlStnNm: normalizedArrival,
      searchDt: searchDt ? String(searchDt) : undefined,
      searchType: searchType ? String(searchType) : undefined,
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    log({
      level: 'info',
      endpoint: '/api/route',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    // Return raw JSON if requested
    if (format === 'raw') {
      return res.status(200).json(data);
    }

    // Return formatted markdown
    const formatted = formatRoute(data, normalizedDeparture, normalizedArrival, lang);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(formatted);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/route',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch route data')
    );
  }
}
