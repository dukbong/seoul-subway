import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations, getEnglishName } from '../../lib/stationMatcher.js';
import type {
  ElevatorLocationApiResponse,
  EscalatorLocationApiResponse,
  WheelchairLiftApiResponse,
  AccessibilityInfo,
  ElevatorLocationInfo,
  EscalatorLocationInfo,
  WheelchairLiftInfo,
} from '../../lib/types/index.js';
import { formatAccessibilityInfo } from '../../lib/accessibilityFormatter.js';
import type { Language } from '../../lib/formatter.js';

type AccessibilityType = 'elevator' | 'escalator' | 'wheelchair' | 'all';

const BASE_URL = 'http://openapi.seoul.go.kr:8088';

/**
 * Fetch and filter accessibility data from Seoul Open API
 */
async function fetchAccessibilityData(
  station: string,
  apiKey: string,
  type: AccessibilityType = 'all'
): Promise<AccessibilityInfo> {
  const result: AccessibilityInfo = {
    station,
    stationEn: getEnglishName(station),
    elevators: [],
    escalators: [],
    wheelchairLifts: [],
  };

  // Helper to fetch and filter by station name
  const fetchAndFilter = async <T extends { stnNm: string }>(
    serviceName: string
  ): Promise<T[]> => {
    try {
      // Fetch all data (no station filter in URL)
      const url = `${BASE_URL}/${apiKey}/json/${serviceName}/1/1000/`;
      const response = await fetchWithRetry(url, { timeout: 10000, retries: 1 });
      if (!response.ok) return [];

      const data = await response.json();

      // Handle both response structures
      let items: T[] = [];
      if (data?.response?.body?.items?.item) {
        items = data.response.body.items.item;
      } else if (data?.[serviceName]?.row) {
        items = data[serviceName].row;
      }

      // Filter by station name
      return items.filter(item => item.stnNm === station);
    } catch (error) {
      console.error(`Error fetching ${serviceName}:`, error);
      return [];
    }
  };

  // Fetch in parallel based on requested type
  const promises: Promise<void>[] = [];

  if (type === 'all' || type === 'elevator') {
    promises.push(
      (async () => {
        result.elevators = await fetchAndFilter<ElevatorLocationInfo>('getFcElvtr');
      })()
    );
  }

  if (type === 'all' || type === 'escalator') {
    promises.push(
      (async () => {
        result.escalators = await fetchAndFilter<EscalatorLocationInfo>('getFcEsctr');
      })()
    );
  }

  if (type === 'all' || type === 'wheelchair') {
    promises.push(
      (async () => {
        result.wheelchairLifts = await fetchAndFilter<WheelchairLiftInfo>('getFcWhcllift');
      })()
    );
  }

  await Promise.all(promises);

  return result;
}

/**
 * Accessibility information API
 *
 * GET /api/accessibility/{station}
 * Query params:
 * - type: elevator | escalator | wheelchair | all (default: all)
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
  const typeParam = (req.query.type as string) || 'all';
  const type: AccessibilityType = ['elevator', 'escalator', 'wheelchair', 'all'].includes(typeParam)
    ? (typeParam as AccessibilityType)
    : 'all';
  const format = (req.query.format as string) || 'formatted';
  const lang: Language = (req.query.lang as Language) === 'en' ? 'en' : 'ko';

  try {
    const data = await fetchAccessibilityData(normalizedStation, apiKey, type);

    // Long cache for facility info (doesn't change frequently)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    log({
      level: 'info',
      endpoint: '/api/accessibility',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    // Return raw JSON if requested
    if (format === 'raw') {
      return res.status(200).json(data);
    }

    // Return formatted markdown
    const formatted = formatAccessibilityInfo(data, lang, type);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(formatted);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/accessibility',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch accessibility data')
    );
  }
}
