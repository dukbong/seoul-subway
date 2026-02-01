import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations, getEnglishName } from '../../lib/stationMatcher.js';
import type { QuickExitApiResponse, QuickExitData } from '../../lib/types/index.js';
import { formatQuickExitInfo } from '../../lib/accessibilityFormatter.js';
import type { Language } from '../../lib/formatter.js';

type FacilityType = 'elevator' | 'escalator' | 'exit' | 'all';

/**
 * Fetch quick exit data from Seoul Open API
 */
async function fetchQuickExitData(
  station: string,
  apiKey: string
): Promise<QuickExitData> {
  const encodedStation = encodeURIComponent(station);
  const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/getFstExit/1/100/${encodedStation}`;

  const result: QuickExitData = {
    station,
    stationEn: getEnglishName(station),
    quickExits: [],
  };

  try {
    const response = await fetchWithRetry(url, { timeout: 5000, retries: 1 });
    if (!response.ok) return result;

    const data = (await response.json()) as QuickExitApiResponse;
    if (data?.getFstExit?.row) {
      result.quickExits = data.getFstExit.row;
    }
  } catch {
    // Return empty result on error
  }

  return result;
}

/**
 * Quick exit information API
 *
 * GET /api/quick-exit/{station}
 * Query params:
 * - facility: elevator | escalator | exit | all (default: all)
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
  const facilityParam = (req.query.facility as string) || 'all';
  const facility: FacilityType = ['elevator', 'escalator', 'exit', 'all'].includes(facilityParam)
    ? (facilityParam as FacilityType)
    : 'all';
  const format = (req.query.format as string) || 'formatted';
  const lang: Language = (req.query.lang as Language) === 'en' ? 'en' : 'ko';

  try {
    const data = await fetchQuickExitData(normalizedStation, apiKey);

    // Long cache for quick exit info (doesn't change frequently)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    log({
      level: 'info',
      endpoint: '/api/quick-exit',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    // Return raw JSON if requested
    if (format === 'raw') {
      return res.status(200).json(data);
    }

    // Return formatted markdown
    const formatted = formatQuickExitInfo(data, lang, facility);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(formatted);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/quick-exit',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch quick exit data')
    );
  }
}
