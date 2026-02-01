/**
 * Route search result formatter
 */

import type { RouteApiResponse, RoutePath } from './types/index.js';
import { getEnglishName } from './stationMatcher.js';
import {
  type Language,
  getLineEmoji,
  createMarkdownTable,
  formatFare,
  formatDuration,
} from './formatter.js';

/**
 * Stations ONLY on non-Seoul Metro lines (not shared with Seoul Metro)
 * These stations cannot be searched via the external API
 */
const NON_SEOUL_METRO_ONLY_STATIONS = new Set([
  // Airport Railroad exclusive stations (공항철도 전용역)
  '인천공항1터미널', '인천공항2터미널', '운서', '영종', '청라국제도시', '검암', '계양',
  // Shinbundang Line exclusive stations (신분당선 전용역 - 강남 등 공유역 제외)
  '청계산입구', '판교', '정자', '미금', '동천', '수지구청', '성복', '상현', '광교중앙', '광교',
  // Gyeongui-Jungang Line exclusive stations (경의중앙선 전용역)
  '파주', '문산', '운정', '금촌', '금릉', '탄현', '풍산',
]);

/**
 * Line 2 circular route stations (for detecting inner/outer loop issues)
 */
const LINE_2_STATIONS = [
  '시청', '을지로입구', '을지로3가', '을지로4가', '동대문역사문화공원',
  '신당', '상왕십리', '왕십리', '한양대', '뚝섬', '성수', '건대입구',
  '구의', '강변', '잠실나루', '잠실', '잠실새내', '종합운동장', '삼성',
  '선릉', '역삼', '강남', '교대', '서초', '방배', '사당', '낙성대',
  '서울대입구', '봉천', '신림', '신대방', '구로디지털단지', '대림',
  '신도림', '문래', '영등포구청', '당산', '합정', '홍대입구', '신촌',
  '이대', '아현', '충정로',
];

/**
 * Check if station is exclusively on non-Seoul Metro lines
 */
function isNonSeoulMetroStation(station: string): boolean {
  return NON_SEOUL_METRO_ONLY_STATIONS.has(station);
}

/**
 * Check if both stations are on Line 2 circular section
 */
function isLine2CircularRoute(departure: string, arrival: string): boolean {
  return LINE_2_STATIONS.includes(departure) && LINE_2_STATIONS.includes(arrival);
}

/**
 * Get index of station in Line 2 circular route
 */
function getLine2Index(station: string): number {
  return LINE_2_STATIONS.indexOf(station);
}

/**
 * Check if this might be an inner loop (clockwise) direction on Line 2
 * Note: This is a heuristic based on station order
 */
function isPossibleInnerLoopDirection(departure: string, arrival: string): boolean {
  const depIdx = getLine2Index(departure);
  const arrIdx = getLine2Index(arrival);

  if (depIdx === -1 || arrIdx === -1) return false;

  // If arrival comes before departure in the list, it's likely inner loop
  // (clockwise direction, which the external API doesn't support well)
  const stationCount = LINE_2_STATIONS.length;
  const outerDistance = (arrIdx - depIdx + stationCount) % stationCount;
  const innerDistance = (depIdx - arrIdx + stationCount) % stationCount;

  // If inner loop distance is shorter, user might be trying that direction
  return innerDistance < outerDistance;
}

const LINE_NAME_TO_SUBWAY_ID: Record<string, string> = {
  '1호선': '1001',
  '2호선': '1002',
  '3호선': '1003',
  '4호선': '1004',
  '5호선': '1005',
  '6호선': '1006',
  '7호선': '1007',
  '8호선': '1008',
  '9호선': '1009',
  '경의중앙선': '1063',
  '공항철도': '1065',
  '경춘선': '1067',
  '수인분당선': '1075',
  '신분당선': '1077',
};

/**
 * Get subwayId from line name
 */
function getSubwayIdFromName(lineName: string): string {
  return LINE_NAME_TO_SUBWAY_ID[lineName] || '1002';
}

/**
 * Format train time from API format (yyyyMMddHHmmss or HHmmss) to HH:MM
 */
function formatTrainTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 4) return '-';
  // API returns either yyyyMMddHHmmss (14 chars) or HHmmss (6 chars)
  const timeOnly = timeStr.length >= 14 ? timeStr.slice(8, 12) : timeStr.slice(0, 4);
  const hours = timeOnly.slice(0, 2);
  const minutes = timeOnly.slice(2, 4);
  return `${hours}:${minutes}`;
}

/**
 * Get line label for display
 */
function getLineLabel(lineName: string, lang: Language): string {
  const match = lineName.match(/^(\d+)호선$/);
  if (match) {
    return lang === 'ko' ? `${match[1]}호선` : `Line ${match[1]}`;
  }
  return lineName;
}

/**
 * Count transfers in path
 */
function countTransfers(paths: RoutePath[]): number {
  return paths.filter(p => p.trsitYn === 'Y').length;
}

/**
 * Build visual route diagram
 */
function buildRouteDiagram(paths: RoutePath[], lang: Language): string {
  if (paths.length === 0) return '';

  const parts: string[] = [];
  let currentLine = '';

  // First station
  const firstPath = paths[0];
  if (firstPath) {
    const lineName = firstPath.dptreStn.lineNm;
    const subwayId = getSubwayIdFromName(lineName);
    const emoji = getLineEmoji(subwayId);
    const stationName = lang === 'ko'
      ? firstPath.dptreStn.stnNm
      : (getEnglishName(firstPath.dptreStn.stnNm) ?? firstPath.dptreStn.stnNm);
    parts.push(`${emoji} ${stationName}`);
    currentLine = lineName;
  }

  // Process path segments
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]!;
    const isLast = i === paths.length - 1;
    const isTransfer = path.trsitYn === 'Y';

    if (isTransfer || isLast) {
      const lineLabel = getLineLabel(currentLine, lang);
      parts.push(`─${lineLabel}─▶`);

      const lineName = path.arvlStn.lineNm;
      const subwayId = getSubwayIdFromName(lineName);
      const emoji = getLineEmoji(subwayId);
      const stationName = lang === 'ko'
        ? path.arvlStn.stnNm
        : (getEnglishName(path.arvlStn.stnNm) ?? path.arvlStn.stnNm);
      parts.push(`${emoji} ${stationName}`);
      currentLine = lineName;
    }
  }

  return parts.join(' ');
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
  // Handle missing body with contextual error messages
  if (!data.body || !data.body.paths || data.body.paths.length === 0) {
    // Check for non-Seoul Metro stations (Airport Railroad, Shinbundang, etc.)
    if (isNonSeoulMetroStation(departureKo) || isNonSeoulMetroStation(arrivalKo)) {
      return lang === 'ko'
        ? `오류: 공항철도/신분당선/경의중앙선 등 타사 노선 연계 경로는 지원되지 않습니다.\n(서울교통공사 노선만 지원)`
        : `Error: Routes involving Airport Railroad, Shinbundang Line, or Gyeongui-Jungang Line are not supported.\n(Seoul Metro lines only)`;
    }

    // Check for Line 2 inner loop direction issues
    if (isLine2CircularRoute(departureKo, arrivalKo) && isPossibleInnerLoopDirection(departureKo, arrivalKo)) {
      return lang === 'ko'
        ? `오류: 2호선 내선(시계방향) 경로 검색이 제한됩니다.\n반대 방향으로 검색하거나 환승 경로를 시도해주세요.`
        : `Error: Line 2 inner loop (clockwise) route search is limited.\nTry the opposite direction or a transfer route.`;
    }

    // Generic error
    return lang === 'ko'
      ? `오류: 경로를 찾을 수 없습니다.\n역명을 확인해주세요.`
      : `Error: Route not found.\nPlease check station names.`;
  }

  const { totalDstc, totalreqHr, totalCardCrg, paths } = data.body;
  const transferCount = countTransfers(paths);

  // Convert seconds to minutes
  const travelTimeMin = Math.ceil(totalreqHr / 60);

  // Convert meters to km
  const distanceKm = (totalDstc / 1000).toFixed(1);

  // Build header
  const depName = lang === 'ko' ? departureKo : (getEnglishName(departureKo) ?? departureKo);
  const arrName = lang === 'ko' ? arrivalKo : (getEnglishName(arrivalKo) ?? arrivalKo);
  const header = `[${depName} → ${arrName}]`;

  // Build summary line
  const timeLabel = lang === 'ko' ? '소요시간' : 'Time';
  const distanceLabel = lang === 'ko' ? '거리' : 'Distance';
  const fareLabel = lang === 'ko' ? '요금' : 'Fare';
  const transferLabel = lang === 'ko' ? '환승' : 'Transfer';
  const transferUnit = lang === 'ko' ? '회' : '';

  const summary = `${timeLabel}: ${formatDuration(travelTimeMin, lang)} | ${distanceLabel}: ${distanceKm}km | ${fareLabel}: ${formatFare(totalCardCrg, lang)} | ${transferLabel}: ${transferCount}${transferUnit}`;

  // Build visual route diagram
  const diagram = buildRouteDiagram(paths, lang);

  // Build detail table
  const tableHeaders = lang === 'ko'
    ? ['구분', '역', '호선', '시간']
    : ['Step', 'Station', 'Line', 'Time'];

  const rows: string[][] = [];

  // First station (departure)
  const firstPath = paths[0];
  if (firstPath) {
    const lineName = firstPath.dptreStn.lineNm;
    const subwayId = getSubwayIdFromName(lineName);
    const emoji = getLineEmoji(subwayId);
    const lineShort = lineName.replace('호선', '');
    const departureTime = formatTrainTime(firstPath.trainDptreTm);
    rows.push([
      lang === 'ko' ? '출발' : 'Depart',
      formatStationName(firstPath.dptreStn.stnNm, lang),
      `${emoji} ${lineShort}`,
      departureTime,
    ]);
  }

  // Transfer stations
  for (const path of paths) {
    if (path.trsitYn === 'Y') {
      const lineName = path.arvlStn.lineNm;
      const subwayId = getSubwayIdFromName(lineName);
      const emoji = getLineEmoji(subwayId);
      const lineShort = lineName.replace('호선', '');
      const arrivalTime = formatTrainTime(path.trainArvlTm);
      rows.push([
        lang === 'ko' ? '환승' : 'Transfer',
        formatStationName(path.arvlStn.stnNm, lang),
        `${emoji} ${lineShort}`,
        arrivalTime,
      ]);
    }
  }

  // Last station (arrival)
  const lastPath = paths[paths.length - 1];
  if (lastPath) {
    const lineName = lastPath.arvlStn.lineNm;
    const subwayId = getSubwayIdFromName(lineName);
    const emoji = getLineEmoji(subwayId);
    const lineShort = lineName.replace('호선', '');
    const arrivalTime = formatTrainTime(lastPath.trainArvlTm);
    rows.push([
      lang === 'ko' ? '도착' : 'Arrive',
      formatStationName(lastPath.arvlStn.stnNm, lang),
      `${emoji} ${lineShort}`,
      arrivalTime,
    ]);
  }

  const table = createMarkdownTable(tableHeaders, rows);

  return `${header}\n\n${summary}\n\n${diagram}\n\n${table}`;
}
