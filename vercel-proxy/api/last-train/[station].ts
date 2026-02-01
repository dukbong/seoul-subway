import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations, getEnglishName } from '../../lib/stationMatcher.js';
import type { StationsApiResponse, LastTrainApiResponse } from '../../lib/types/index.js';

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
 * Convert HHMMSS to HH:MM format
 */
function formatTime(hhmmss: string): string {
  if (!hhmmss || hhmmss.length < 4) return hhmmss;
  const hours = hhmmss.substring(0, 2);
  const minutes = hhmmss.substring(2, 4);
  return `${hours}:${minutes}`;
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
 * Map direction tag to Korean/English
 */
function getDirectionLabel(inoutTag: string, lineNum: string): { ko: string; en: string } {
  // 2호선은 내선/외선, 나머지는 상행/하행
  if (lineNum === '02호선') {
    return inoutTag === '1'
      ? { ko: '내선순환', en: 'Inner Circle' }
      : { ko: '외선순환', en: 'Outer Circle' };
  }
  return inoutTag === '1'
    ? { ko: '상행', en: 'Upbound' }
    : { ko: '하행', en: 'Downbound' };
}

/**
 * Map line number to English
 */
function getLineEnglish(lineNum: string): string {
  const match = lineNum.match(/(\d+)호선/);
  if (match?.[1]) return `Line ${parseInt(match[1])}`;
  if (lineNum.includes('신분당')) return 'Sinbundang Line';
  if (lineNum.includes('경의') || lineNum.includes('중앙')) return 'Gyeongui-Jungang Line';
  if (lineNum.includes('공항')) return 'Airport Railroad';
  if (lineNum.includes('수인') || lineNum.includes('분당')) return 'Suin-Bundang Line';
  return lineNum;
}

/**
 * Get station code by station name
 */
async function getStationCode(
  stationName: string,
  apiKey: string
): Promise<string | null> {
  const encodedStation = encodeURIComponent(stationName);
  const apiUrl = `http://openapi.seoul.go.kr:8088/${apiKey}/json/SearchInfoBySubwayNameService/1/1/${encodedStation}`;

  const response = await fetchWithRetry(apiUrl, { timeout: 4000, retries: 1 });
  const data = await response.json() as StationsApiResponse;

  if (data.SearchInfoBySubwayNameService?.row?.[0]) {
    return data.SearchInfoBySubwayNameService.row[0].STATION_CD;
  }
  return null;
}

/**
 * Fetch last train data for a station
 */
export async function getLastTrainData(
  station: string,
  apiKey: string,
  options: LastTrainOptions = {}
): Promise<LastTrainResponse> {
  const { direction = 'all', weekType = getCurrentWeekType() } = options;

  // 1. Get station code first
  const stationCode = await getStationCode(station, apiKey);
  if (!stationCode) {
    throw new Error('Station code not found');
  }

  // 2. Fetch last train times
  // direction: 0=all, 1=상행/내선, 2=하행/외선
  const directionParam = direction === 'up' ? '1' : direction === 'down' ? '2' : '0';
  const apiUrl = `http://openapi.seoul.go.kr:8088/${apiKey}/json/SearchLastTrainTimeOfLine/1/10/${stationCode}/${weekType}/${directionParam}`;

  const response = await fetchWithRetry(apiUrl, { timeout: 4000, retries: 1 });
  const data = await response.json() as LastTrainApiResponse;

  const rows = data.SearchLastTrainTimeOfLine?.row ?? [];
  const stationEn = getEnglishName(station) ?? station;

  const lastTrains: LastTrainResult[] = rows.map(row => {
    const dirLabel = getDirectionLabel(row.INOUT_TAG, row.LINE_NUM);
    const weekLabel = getWeekTypeLabel(row.WEEK_TAG);
    const destinationEn = getEnglishName(row.LAST_STATION) ?? row.LAST_STATION;

    return {
      direction: `${row.LAST_STATION}방면`,
      directionEn: `To ${destinationEn}`,
      time: formatTime(row.LAST_TIME),
      weekType: weekLabel.ko,
      weekTypeEn: weekLabel.en,
      line: row.LINE_NUM,
      lineEn: getLineEnglish(row.LINE_NUM),
      destination: row.LAST_STATION,
      destinationEn,
    };
  });

  return {
    station,
    stationEn,
    lastTrains,
  };
}

/**
 * Last train time proxy
 *
 * Original API: http://openapi.seoul.go.kr:8088/{KEY}/json/SearchLastTrainTimeOfLine/{start}/{end}/{stationCode}/{weekType}/{inoutTag}
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

  const apiKey = process.env.SEOUL_OPENAPI_KEY;
  if (!apiKey) {
    return res.status(500).json(createError(ErrorCodes.API_KEY_ERROR, 'API key not configured'));
  }

  try {
    const { direction, weekType } = req.query;

    const data = await getLastTrainData(normalizedStation, apiKey, {
      direction: direction === 'up' || direction === 'down' ? direction : 'all',
      weekType: weekType === '1' || weekType === '2' || weekType === '3' ? weekType : undefined,
    });

    // Cache for 1 hour (막차 시간표는 자주 변경되지 않음)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

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
