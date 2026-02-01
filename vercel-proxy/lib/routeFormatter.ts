/**
 * Route search result formatter
 */

import type { RouteApiResponse, PathSegment } from './types/index.js';
import { getEnglishName } from './stationMatcher.js';
import {
  type Language,
  getLineEmoji,
  createMarkdownTable,
  formatFare,
  formatDuration,
} from './formatter.js';

/**
 * Line code to subwayId mapping
 */
const LINE_CODE_TO_SUBWAY_ID: Record<string, string> = {
  '01': '1001',
  '02': '1002',
  '03': '1003',
  '04': '1004',
  '05': '1005',
  '06': '1006',
  '07': '1007',
  '08': '1008',
  '09': '1009',
  'K1': '1063', // Gyeongui-Jungang
  'A1': '1065', // Airport Railroad
  'K4': '1067', // Gyeongchun
  'D1': '1075', // Suin-Bundang
  'D2': '1077', // Sinbundang
};

/**
 * Get subwayId from line code
 */
function getSubwayId(lnCd: string): string {
  return LINE_CODE_TO_SUBWAY_ID[lnCd] || '1002';
}

/**
 * Get line name from line name field or code
 */
function getLineLabel(segment: PathSegment, lang: Language): string {
  // Use lnNm if available
  if (segment.lnNm) {
    // Extract line number from lnNm (e.g., "2호선" -> "2")
    const match = segment.lnNm.match(/^(\d+)호선$/);
    if (match) {
      return lang === 'ko' ? `${match[1]}호선` : `Line ${match[1]}`;
    }
    // For non-numbered lines
    return segment.lnNm;
  }
  return segment.lnCd;
}

/**
 * Count transfers in path
 */
function countTransfers(path: PathSegment[]): number {
  return path.filter(seg => seg.transferYn === 'Y').length;
}

/**
 * Build visual route diagram
 * e.g., 🟢 강남 ─2호선─▶ 🟢 신도림 ─2호선─▶ 🟢 홍대입구
 */
function buildRouteDiagram(path: PathSegment[], lang: Language): string {
  if (path.length === 0) return '';

  const parts: string[] = [];
  let currentLine = '';

  for (let i = 0; i < path.length; i++) {
    const segment = path[i]!;
    const subwayId = getSubwayId(segment.lnCd);
    const emoji = getLineEmoji(subwayId);
    const stationName = lang === 'ko'
      ? segment.stnNm
      : (getEnglishName(segment.stnNm) ?? segment.stnNm);

    if (i === 0) {
      // First station
      parts.push(`${emoji} ${stationName}`);
      currentLine = segment.lnNm ?? segment.lnCd;
    } else if (segment.transferYn === 'Y' || i === path.length - 1) {
      // Transfer point or last station
      const lineLabel = getLineLabel({ idx: segment.idx, stnNm: segment.stnNm, lnCd: segment.lnCd, lnNm: currentLine }, lang);
      parts.push(`─${lineLabel}─▶`);
      parts.push(`${emoji} ${stationName}`);
      currentLine = segment.lnNm ?? segment.lnCd;
    }
  }

  return parts.join(' ');
}

/**
 * Determine step type (departure, transfer, arrival)
 */
function getStepType(index: number, total: number, segment: PathSegment, lang: Language): string {
  if (index === 0) {
    return lang === 'ko' ? '출발' : 'Depart';
  }
  if (index === total - 1) {
    return lang === 'ko' ? '도착' : 'Arrive';
  }
  if (segment.transferYn === 'Y') {
    return lang === 'ko' ? '환승' : 'Transfer';
  }
  return lang === 'ko' ? '경유' : 'Via';
}

/**
 * Format station name with bilingual support
 */
function formatStationName(station: string, lang: Language): string {
  const stationEn = getEnglishName(station);
  if (lang === 'ko') {
    return stationEn ? `${station} ${stationEn}` : station;
  }
  return stationEn ? `${stationEn} ${station}` : station;
}

/**
 * Format route search result to markdown
 */
export function formatRoute(
  data: RouteApiResponse,
  departureKo: string,
  arrivalKo: string,
  lang: Language
): string {
  // Handle missing result
  if (!data.result) {
    return lang === 'ko'
      ? `오류: 경로를 찾을 수 없습니다.`
      : `Error: Route not found.`;
  }

  const { globalTravelTime, fare, path } = data.result;
  const transferCount = countTransfers(path);

  // Build header
  const depName = lang === 'ko' ? departureKo : (getEnglishName(departureKo) || departureKo);
  const arrName = lang === 'ko' ? arrivalKo : (getEnglishName(arrivalKo) || arrivalKo);
  const header = `[${depName} → ${arrName}]`;

  // Build summary line
  const timeLabel = lang === 'ko' ? '소요시간' : 'Time';
  const fareLabel = lang === 'ko' ? '요금' : 'Fare';
  const transferLabel = lang === 'ko' ? '환승' : 'Transfer';
  const transferUnit = lang === 'ko' ? '회' : '';

  const summary = `${timeLabel}: ${formatDuration(globalTravelTime, lang)} | ${fareLabel}: ${formatFare(fare, lang)} | ${transferLabel}: ${transferCount}${transferUnit}`;

  // Build visual route diagram
  const diagram = buildRouteDiagram(path, lang);

  // Build detail table (only show key stations: departure, transfers, arrival)
  const tableHeaders = lang === 'ko'
    ? ['구분', '역', '호선']
    : ['Step', 'Station', 'Line'];

  const keyStations: { segment: PathSegment; index: number }[] = [];

  // Always include first station
  const firstSegment = path[0];
  if (firstSegment) {
    keyStations.push({ segment: firstSegment, index: 0 });
  }

  // Add transfer stations
  for (let i = 1; i < path.length - 1; i++) {
    const seg = path[i];
    if (seg && seg.transferYn === 'Y') {
      keyStations.push({ segment: seg, index: i });
    }
  }

  // Always include last station
  const lastSegment = path[path.length - 1];
  if (path.length > 1 && lastSegment) {
    keyStations.push({ segment: lastSegment, index: path.length - 1 });
  }

  const rows: string[][] = keyStations.map(({ segment, index }) => {
    const stepType = getStepType(index, path.length, segment, lang);
    const stationName = formatStationName(segment.stnNm, lang);
    const subwayId = getSubwayId(segment.lnCd);
    const emoji = getLineEmoji(subwayId);
    const lineShort = segment.lnNm?.replace('호선', '') || segment.lnCd;

    return [stepType, stationName, `${emoji} ${lineShort}`];
  });

  const table = createMarkdownTable(tableHeaders, rows);

  return `${header}\n\n${summary}\n\n${diagram}\n\n${table}`;
}
