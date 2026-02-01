import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations, getEnglishName } from '../../lib/stationMatcher.js';
import type { RestroomInfo, RestroomData } from '../../lib/types/index.js';
import { formatRestroomInfo } from '../../lib/restroomFormatter.js';
import type { Language } from '../../lib/formatter.js';

const BASE_URL = 'http://openapi.seoul.go.kr:8088';

/**
 * Fetch restroom data from Seoul Open API
 */
async function fetchRestroomData(
  station: string,
  apiKey: string
): Promise<RestroomData> {
  const result: RestroomData = {
    station,
    stationEn: getEnglishName(station),
    restrooms: [],
  };

  try {
    const url = `${BASE_URL}/${apiKey}/json/getFcRstrm/1/1000/`;
    const response = await fetchWithRetry(url, { timeout: 10000, retries: 1 });
    if (!response.ok) return result;

    const data = await response.json();

    // Handle both response structures
    let items: RestroomInfo[] = [];
    if (data?.response?.body?.items?.item) {
      items = data.response.body.items.item;
    } else if (data?.getFcRstrm?.row) {
      items = data.getFcRstrm.row;
    }

    // Filter by station name
    result.restrooms = items.filter(item => item.stnNm === station);
  } catch (error) {
    console.error('Error fetching restroom data:', error);
  }

  return result;
}

/**
 * Restroom information API
 *
 * GET /api/restrooms/{station}
 * Query params:
 * - format: formatted (markdown) | raw (JSON)
 * - lang: ko | en
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

  // Normalize station name
  const normalizedStation = matchStation(station);
  if (!normalizedStation) {
    const suggestions = suggestStations(station);
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

  // Parse query params
  const format = (req.query.format as string) || 'formatted';
  const lang: Language = (req.query.lang as Language) === 'en' ? 'en' : 'ko';

  try {
    const data = await fetchRestroomData(normalizedStation, apiKey);

    // Long cache for restroom info (doesn't change frequently)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    log({
      level: 'info',
      endpoint: '/api/restrooms',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    // Return raw JSON if requested
    if (format === 'raw') {
      return res.status(200).json(data);
    }

    // Return formatted markdown
    const formatted = formatRestroomInfo(data, lang);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(formatted);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/restrooms',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch restroom data')
    );
  }
}
