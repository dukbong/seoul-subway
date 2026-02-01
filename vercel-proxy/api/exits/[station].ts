import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations, getEnglishName } from '../../lib/stationMatcher.js';
import { exitsData, type ExitInfo, type StationExits } from '../../data/exitsData.js';

export interface ExitsResponse {
  station: string;
  stationEn: string;
  line: string;
  exits: ExitInfo[];
}

/**
 * Get exit information for a station
 */
export function getExitsData(station: string): ExitsResponse | null {
  const stationExits = exitsData[station];
  if (!stationExits) {
    return null;
  }

  return {
    station,
    stationEn: stationExits.stationEn,
    line: stationExits.line,
    exits: stationExits.exits,
  };
}

/**
 * List all stations with exit information
 */
export function listAvailableStations(): string[] {
  return Object.keys(exitsData);
}

/**
 * Exit information API
 *
 * Proxy API: /api/exits/{station}
 *
 * Returns exit information for major stations including:
 * - Exit number
 * - Nearby landmarks (Korean/English)
 * - Walking distance
 * - Facility types
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

  // Normalize station name (supports English input, case-insensitive)
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

  const data = getExitsData(normalizedStation);
  if (!data) {
    // Station exists but no exit data available
    const availableStations = listAvailableStations();
    return res.status(404).json(
      createError(
        ErrorCodes.INVALID_STATION,
        'Exit information not available for this station',
        {
          input: station,
          normalizedStation,
          availableStationsCount: availableStations.length,
          hint: 'Exit information is available for major tourist stations only',
        },
        '이 역의 출구 정보가 아직 준비되지 않았습니다'
      )
    );
  }

  // Long cache - static data
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800');

  log({
    level: 'info',
    endpoint: '/api/exits',
    method: req.method,
    duration: Date.now() - startTime,
    status: 200,
  });

  return res.status(200).json(data);
}
