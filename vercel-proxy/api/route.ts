import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../lib/errors.js';
import { log } from '../lib/logger.js';
import { matchStation, suggestStations, suggestStationsEnhanced } from '../lib/stationMatcher.js';
import type { RouteApiResponse } from '../lib/types/index.js';
import { formatRoute } from '../lib/routeFormatter.js';
import type { Language } from '../lib/formatter.js';
import {
  findShortestPath,
  findStationIdByName,
  isSeoulMetroStation,
  formatPathResultKo,
  formatPathResultEn,
  formatPathResultJson,
} from '../lib/routing/index.js';

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
 * Check if a station requires internal routing (non-Seoul Metro station)
 */
function requiresInternalRouting(stationName: string): boolean {
  const stationId = findStationIdByName(stationName);
  if (!stationId) {
    return false;
  }
  return !isSeoulMetroStation(stationId);
}

/**
 * Non-Seoul Metro station list for quick lookup
 */
const NON_SEOUL_METRO_KEYWORDS = [
  // 공항철도
  '인천공항', '영종', '운서', '공항화물청사', '계양',
  // 신분당선
  '판교', '정자', '미금', '동천', '수지구청', '성복', '상현', '광교',
  '양재시민의숲', '청계산입구',
  // 경의중앙선 주요역
  '문산', '파주', '금촌', '운정', '일산', '탄현', '야당',
  '행신', '능곡', '서강대', '한남', '서빙고', '응봉',
  '망우', '양원', '도농', '덕소', '팔당', '양평', '용문', '지평',
  // 수인분당선 주요역
  '서울숲', '압구정로데오', '한티', '구룡', '개포동', '대모산입구',
  '가천대', '태평', '야탑', '이매', '서현', '수내', '오리', '죽전',
  '보정', '구성', '신갈', '기흥', '상갈', '청명', '영통', '망포',
  '매탄권선', '수원시청', '매교', '고색', '오목천', '어천', '야목', '사리',
  '달월', '월곶', '소래포구', '인천논현', '호구포', '남동인더스파크',
  '원인재', '연수', '송도', '인하대', '숭의', '신포',
];

/**
 * Quick check for non-Seoul Metro stations using keywords
 */
function hasNonSeoulMetroKeyword(stationName: string): boolean {
  return NON_SEOUL_METRO_KEYWORDS.some((keyword) => stationName.includes(keyword));
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

  log({
    level: 'debug',
    endpoint: '/api/route',
    message: 'Requesting external API',
    params: {
      dptreStnNm,
      arvlStnNm,
      searchDt: searchDt || getKSTDateTime(),
      searchType: searchType || undefined,
    },
  });

  const response = await fetchWithRetry(apiUrl, { timeout: 4000, retries: 1 });
  const data = await response.json() as RouteApiResponse;

  log({
    level: 'debug',
    endpoint: '/api/route',
    message: 'External API response',
    hasBody: !!data.body,
    pathCount: data.body?.paths?.length ?? 0,
  });

  return data;
}

/**
 * Route search proxy with hybrid routing
 *
 * Original API: https://apis.data.go.kr/B553766/path/getShtrmPath
 * Proxy API: /api/route?dptreStnNm=신도림&arvlStnNm=서울역&searchDt=2024-01-01%2012:00:00
 *
 * For non-Seoul Metro stations (Airport Railroad, Sinbundang, etc.),
 * uses internal Dijkstra-based routing.
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
    const enhancedSuggestions = suggestStationsEnhanced(String(dptreStnNm));
    const suggestions = enhancedSuggestions.map(s =>
      s.english ? `${s.korean} (${s.english})` : s.korean
    );

    log({
      level: 'debug',
      endpoint: '/api/route',
      message: 'Station match failed',
      param: 'dptreStnNm',
      input: dptreStnNm,
      suggestionCount: suggestions.length,
    });

    return res.status(400).json(
      createError(ErrorCodes.INVALID_STATION, 'Departure station not found', {
        input: dptreStnNm,
        param: 'dptreStnNm',
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        suggestionsDetailed: enhancedSuggestions.length > 0 ? enhancedSuggestions : undefined,
        hint: 'Try Korean name directly or check spelling',
      })
    );
  }

  // Normalize arrival station name
  const normalizedArrival = matchStation(String(arvlStnNm));
  if (!normalizedArrival) {
    const enhancedSuggestions = suggestStationsEnhanced(String(arvlStnNm));
    const suggestions = enhancedSuggestions.map(s =>
      s.english ? `${s.korean} (${s.english})` : s.korean
    );

    log({
      level: 'debug',
      endpoint: '/api/route',
      message: 'Station match failed',
      param: 'arvlStnNm',
      input: arvlStnNm,
      suggestionCount: suggestions.length,
    });

    return res.status(400).json(
      createError(ErrorCodes.INVALID_STATION, 'Arrival station not found', {
        input: arvlStnNm,
        param: 'arvlStnNm',
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        suggestionsDetailed: enhancedSuggestions.length > 0 ? enhancedSuggestions : undefined,
        hint: 'Try Korean name directly or check spelling',
      })
    );
  }

  // Parse format and lang parameters
  const format = (req.query.format as string) || 'formatted';
  const lang: Language = (req.query.lang as Language) === 'en' ? 'en' : 'ko';

  // Check if internal routing is needed (non-Seoul Metro stations)
  const useInternalRouting =
    hasNonSeoulMetroKeyword(normalizedDeparture) ||
    hasNonSeoulMetroKeyword(normalizedArrival) ||
    requiresInternalRouting(normalizedDeparture) ||
    requiresInternalRouting(normalizedArrival);

  if (useInternalRouting) {
    // Use internal Dijkstra-based routing
    log({
      level: 'info',
      endpoint: '/api/route',
      message: 'Using internal routing',
      departure: normalizedDeparture,
      arrival: normalizedArrival,
    });

    const pathResult = findShortestPath(normalizedDeparture, normalizedArrival);

    if (!pathResult) {
      log({
        level: 'warn',
        endpoint: '/api/route',
        message: 'Internal routing failed - no path found',
        departure: normalizedDeparture,
        arrival: normalizedArrival,
      });

      return res.status(404).json(
        createError(ErrorCodes.EXTERNAL_API_ERROR, 'No route found between stations', {
          departure: normalizedDeparture,
          arrival: normalizedArrival,
          hint: 'The stations may not be connected in the current graph',
        })
      );
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    log({
      level: 'info',
      endpoint: '/api/route',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
      routingType: 'internal',
    });

    // Return raw JSON if requested
    if (format === 'raw') {
      return res.status(200).json(formatPathResultJson(pathResult));
    }

    // Return formatted markdown
    const formatted = lang === 'en' ? formatPathResultEn(pathResult) : formatPathResultKo(pathResult);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(formatted);
  }

  // Use external API for Seoul Metro stations
  const apiKey = process.env.DATA_GO_KR_KEY;
  if (!apiKey) {
    return res.status(500).json(createError(ErrorCodes.API_KEY_ERROR, 'API key not configured'));
  }

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
      routingType: 'external',
    });

    // Return raw JSON if requested
    if (format === 'raw') {
      return res.status(200).json(data);
    }

    // Return formatted markdown
    const formatted = formatRoute(data, normalizedDeparture, normalizedArrival, lang);

    // Check if external API returned error - fallback to internal routing
    if (formatted.startsWith('Error:') || formatted.startsWith('오류:')) {
      log({
        level: 'info',
        endpoint: '/api/route',
        message: 'External API returned error, falling back to internal routing',
        formattedError: formatted.substring(0, 100),
      });

      const pathResult = findShortestPath(normalizedDeparture, normalizedArrival);

      if (pathResult) {
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        if (format === 'raw') {
          return res.status(200).json(formatPathResultJson(pathResult));
        }

        const internalFormatted = lang === 'en' ? formatPathResultEn(pathResult) : formatPathResultKo(pathResult);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(internalFormatted);
      }
    }

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

    // Fallback to internal routing if external API fails
    log({
      level: 'info',
      endpoint: '/api/route',
      message: 'External API failed, falling back to internal routing',
      error: errorMessage,
    });

    const pathResult = findShortestPath(normalizedDeparture, normalizedArrival);

    if (pathResult) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

      if (format === 'raw') {
        return res.status(200).json(formatPathResultJson(pathResult));
      }

      const formatted = lang === 'en' ? formatPathResultEn(pathResult) : formatPathResultKo(pathResult);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(formatted);
    }

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch route data')
    );
  }
}
