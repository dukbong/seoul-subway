import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';

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
) {
  const { start = '0', end = '10' } = options;
  const encodedStation = encodeURIComponent(station);
  const apiUrl = `http://swopenAPI.seoul.go.kr/api/subway/${apiKey}/json/realtimeStationArrival/${start}/${end}/${encodedStation}`;

  const response = await fetchWithRetry(apiUrl, { timeout: 8000, retries: 2 });
  return response.json();
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

  const { station } = req.query;
  if (!station || typeof station !== 'string') {
    return res.status(400).json(
      createError(ErrorCodes.MISSING_PARAM, 'Station parameter is required', { required: ['station'] })
    );
  }

  const apiKey = process.env.SEOUL_OPENAPI_KEY;
  if (!apiKey) {
    return res.status(500).json(createError(ErrorCodes.API_KEY_ERROR, 'API key not configured'));
  }

  try {
    const data = await getRealtimeData(station, apiKey, {
      start: req.query.start as string,
      end: req.query.end as string,
    });

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

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch realtime data')
    );
  }
}
