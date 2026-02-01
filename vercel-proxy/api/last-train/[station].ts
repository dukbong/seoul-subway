import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations } from '../../lib/stationMatcher.js';
import { lastTrainData, hasLastTrainData, getAvailableStations } from '../../data/lastTrainData.js';

export interface LastTrainOptions {
  direction?: 'up' | 'down' | 'all';
  weekType?: '1' | '2' | '3'; // 1=평일, 2=토요일, 3=일요일/공휴일
}

interface LastTrainResult {
  direction: string;
  directionEn: string;
  time: string;
  weekType: string;
  weekTypeEn: string;
  line: string;
  lineEn: string;
  destination: string;
  destinationEn: string;
}

interface LastTrainResponse {
  station: string;
  stationEn: string;
  lastTrains: LastTrainResult[];
}

/**
 * Get current week type (1=weekday, 2=Saturday, 3=Sunday/Holiday)
 */
function getCurrentWeekType(): '1' | '2' | '3' {
  const now = new Date();
  // Convert to KST
  const kstOffset = 9 * 60;
  const utcOffset = now.getTimezoneOffset();
  const kstTime = new Date(now.getTime() + (kstOffset + utcOffset) * 60 * 1000);
  const day = kstTime.getDay();

  if (day === 0) return '3'; // Sunday
  if (day === 6) return '2'; // Saturday
  return '1'; // Weekday
}

/**
 * Map week type to Korean/English
 */
function getWeekTypeLabel(weekType: string): { ko: string; en: string } {
  switch (weekType) {
    case '1': return { ko: '평일', en: 'Weekday' };
    case '2': return { ko: '토요일', en: 'Saturday' };
    case '3': return { ko: '일요일/공휴일', en: 'Sunday/Holiday' };
    default: return { ko: weekType, en: weekType };
  }
}

/**
 * Get last train data from static data
 */
export function getLastTrainData(
  station: string,
  options: LastTrainOptions = {}
): LastTrainResponse {
  const { direction = 'all', weekType = getCurrentWeekType() } = options;

  const stationData = lastTrainData[station];
  if (!stationData) {
    throw new Error('Station not found in last train data');
  }

  const weekLabel = getWeekTypeLabel(weekType);
  const lastTrains: LastTrainResult[] = [];

  for (const lineSchedule of stationData.lines) {
    // Select schedule based on week type
    let scheduleEntries;
    switch (weekType) {
      case '2':
        scheduleEntries = lineSchedule.saturday;
        break;
      case '3':
        scheduleEntries = lineSchedule.sunday;
        break;
      default:
        scheduleEntries = lineSchedule.weekday;
    }

    for (const entry of scheduleEntries) {
      // Filter by direction if specified
      if (direction === 'up') {
        // up = 상행/내선
        if (entry.direction !== '상행' && entry.direction !== '내선순환') continue;
      } else if (direction === 'down') {
        // down = 하행/외선
        if (entry.direction !== '하행' && entry.direction !== '외선순환') continue;
      }

      lastTrains.push({
        direction: `${entry.destination}방면`,
        directionEn: `To ${entry.destinationEn}`,
        time: entry.time,
        weekType: weekLabel.ko,
        weekTypeEn: weekLabel.en,
        line: lineSchedule.line,
        lineEn: lineSchedule.lineEn,
        destination: entry.destination,
        destinationEn: entry.destinationEn,
      });
    }
  }

  return {
    station,
    stationEn: stationData.stationEn,
    lastTrains,
  };
}

/**
 * Last train time API using static data
 *
 * Proxy API: /api/last-train/{station}?direction=up&weekType=1
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

  // Check if station has static data
  if (!hasLastTrainData(normalizedStation)) {
    const availableStations = getAvailableStations();
    return res.status(404).json(
      createError(ErrorCodes.STATION_NOT_FOUND, 'Last train data not available for this station', {
        input: station,
        normalized: normalizedStation,
        availableStations: availableStations.slice(0, 10),
        hint: 'Last train data is available for major stations only',
      })
    );
  }

  try {
    const { direction, weekType } = req.query;

    const data = getLastTrainData(normalizedStation, {
      direction: direction === 'up' || direction === 'down' ? direction : 'all',
      weekType: weekType === '1' || weekType === '2' || weekType === '3' ? weekType : undefined,
    });

    // Cache for 1 day (static data, very rarely changes)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

    log({
      level: 'info',
      endpoint: '/api/last-train',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    return res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/last-train',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch last train data')
    );
  }
}
