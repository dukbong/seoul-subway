import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations, getEnglishName } from '../../lib/stationMatcher.js';
import type {
  ElevatorLocationApiResponse,
  EscalatorLocationApiResponse,
  ElevatorOperationApiResponse,
  EscalatorOperationApiResponse,
  WheelchairLiftApiResponse,
  AccessibilityInfo,
} from '../../lib/types/index.js';
import { formatAccessibilityInfo } from '../../lib/accessibilityFormatter.js';
import type { Language } from '../../lib/formatter.js';

type AccessibilityType = 'elevator' | 'escalator' | 'wheelchair' | 'all';

/**
 * Fetch accessibility data from Seoul Open API
 */
async function fetchAccessibilityData(
  station: string,
  apiKey: string,
  type: AccessibilityType = 'all'
): Promise<AccessibilityInfo> {
  const encodedStation = encodeURIComponent(station);
  const baseUrl = 'http://openapi.seoul.go.kr:8088';

  const fetchApi = async <T>(serviceName: string): Promise<T | null> => {
    try {
      const url = `${baseUrl}/${apiKey}/json/${serviceName}/1/100/${encodedStation}`;
      const response = await fetchWithRetry(url, { timeout: 5000, retries: 1 });
      if (!response.ok) return null;
      return response.json() as Promise<T>;
    } catch {
      return null;
    }
  };

  const result: AccessibilityInfo = {
    station,
    stationEn: getEnglishName(station),
    elevators: { locations: [], operations: [] },
    escalators: { locations: [], operations: [] },
    wheelchairLifts: [],
  };

  // Fetch in parallel based on requested type
  const promises: Promise<void>[] = [];

  if (type === 'all' || type === 'elevator') {
    promises.push(
      (async () => {
        const [locations, operations] = await Promise.all([
          fetchApi<ElevatorLocationApiResponse>('getFcElvtr'),
          fetchApi<ElevatorOperationApiResponse>('getWksnElvtr'),
        ]);
        if (locations?.getFcElvtr?.row) {
          result.elevators.locations = locations.getFcElvtr.row;
        }
        if (operations?.getWksnElvtr?.row) {
          result.elevators.operations = operations.getWksnElvtr.row;
        }
      })()
    );
  }

  if (type === 'all' || type === 'escalator') {
    promises.push(
      (async () => {
        const [locations, operations] = await Promise.all([
          fetchApi<EscalatorLocationApiResponse>('getFcEsctr'),
          fetchApi<EscalatorOperationApiResponse>('getWksnEsctr'),
        ]);
        if (locations?.getFcEsctr?.row) {
          result.escalators.locations = locations.getFcEsctr.row;
        }
        if (operations?.getWksnEsctr?.row) {
          result.escalators.operations = operations.getWksnEsctr.row;
        }
      })()
    );
  }

  if (type === 'all' || type === 'wheelchair') {
    promises.push(
      (async () => {
        const wheelchairData = await fetchApi<WheelchairLiftApiResponse>('getWksnWhcllift');
        if (wheelchairData?.getWksnWhcllift?.row) {
          result.wheelchairLifts = wheelchairData.getWksnWhcllift.row;
        }
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
