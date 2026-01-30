import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../lib/errors.js';
import { log } from '../lib/logger.js';

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
export async function getRouteData(apiKey: string, options: RouteOptions) {
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

  const response = await fetchWithRetry(apiUrl, { timeout: 8000, retries: 2 });
  return response.json();
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

  const apiKey = process.env.DATA_GO_KR_KEY;
  if (!apiKey) {
    return res.status(500).json(createError(ErrorCodes.API_KEY_ERROR, 'API key not configured'));
  }

  try {
    const data = await getRouteData(apiKey, {
      dptreStnNm: String(dptreStnNm),
      arvlStnNm: String(arvlStnNm),
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

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch route data')
    );
  }
}
