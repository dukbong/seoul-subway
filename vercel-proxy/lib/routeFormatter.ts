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
 * Line name to subwayId mapping
 */
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
  // Handle missing body
  if (!data.body || !data.body.paths || data.body.paths.length === 0) {
    return lang === 'ko'
      ? `오류: 경로를 찾을 수 없습니다.`
      : `Error: Route not found.`;
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
