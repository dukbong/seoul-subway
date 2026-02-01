/**
 * Real-time arrival information formatter
 */

import type { RealtimeArrival, RealtimeApiResponse } from './types/index.js';
import { getEnglishName } from './stationMatcher.js';
import {
  type Language,
  getLineEmoji,
  getLineShort,
  createMarkdownTable,
} from './formatter.js';

// Direction translation map
const DIRECTION_MAP: Record<string, string> = {
  '상행': 'Northbound',
  '하행': 'Southbound',
  '내선순환': 'Inner Circle',
  '외선순환': 'Outer Circle',
  '상선': 'Upbound',
  '하선': 'Downbound',
  '상행(외선)': 'Northbound (Outer)',
  '하행(내선)': 'Southbound (Inner)',
};

/**
 * Format up/down line direction with translation
 */
function formatUpDownLine(updnLine: string | undefined, lang: Language): string {
  if (!updnLine) return '';
  if (lang === 'ko') return updnLine;
  return DIRECTION_MAP[updnLine] || updnLine;
}

/**
 * Parse arrival message to extract time/status
 */
function parseArrivalMessage(msg: string, lang: Language): string {
  // Handle common patterns
  if (msg.includes('도착')) {
    return lang === 'ko' ? '도착' : 'Arriving';
  }
  if (msg.includes('출발')) {
    return lang === 'ko' ? '출발' : 'Departed';
  }
  if (msg.includes('진입')) {
    return lang === 'ko' ? '진입' : 'Approaching';
  }

  // Extract minutes (e.g., "3분 후")
  const minMatch = msg.match(/(\d+)분/);
  if (minMatch) {
    const mins = minMatch[1];
    return lang === 'ko' ? `${mins}분` : `${mins} min`;
  }

  // Extract station count (e.g., "5전역")
  const stationMatch = msg.match(/(\d+)전역/);
  if (stationMatch) {
    const count = stationMatch[1];
    return lang === 'ko' ? `${count}역 전` : `${count} stops`;
  }

  return msg;
}

/**
 * Get train type label
 */
function getTrainType(arrival: RealtimeArrival, lang: Language): string {
  // Check for fast train
  if (arrival.isFastTrain === '1') {
    return lang === 'ko' ? '급행' : 'Express';
  }
  return lang === 'ko' ? '일반' : 'Regular';
}

/**
 * Format direction with bilingual support including updnLine
 */
function formatDirection(arrival: RealtimeArrival, lang: Language): string {
  const destination = arrival.bstatnNm || '';
  const destEn = getEnglishName(destination);
  const updnLine = formatUpDownLine(arrival.updnLine, lang);

  if (lang === 'ko') {
    const dirPart = updnLine ? `${updnLine} ` : '';
    return destEn ? `${dirPart}${destination} (${destEn})` : `${dirPart}${destination}`;
  } else {
    const dirPart = updnLine ? `${updnLine} ` : '';
    return destEn ? `${dirPart}${destEn} (${destination})` : `${dirPart}${destination}`;
  }
}

/**
 * Format location (current position of train)
 */
function formatLocation(arrival: RealtimeArrival, lang: Language): string {
  // arvlMsg3 contains current station info
  const location = arrival.arvlMsg3 || '';

  // Extract station name from location string
  const stationMatch = location.match(/^(.+?)(?:\s|$)/);
  if (stationMatch && stationMatch[1]) {
    const station: string = stationMatch[1];
    if (lang === 'en') {
      const stationEn = getEnglishName(station);
      return stationEn ?? station;
    }
    return station;
  }

  return location;
}

/**
 * Format real-time arrivals to markdown table
 */
export function formatRealtimeArrivals(
  data: RealtimeApiResponse,
  stationKo: string,
  lang: Language
): string {
  // Handle error response (INFO-000 is success, not an error)
  if (data.errorMessage && data.errorMessage.code !== 'INFO-000') {
    const errorMsg = lang === 'ko'
      ? `오류: ${data.errorMessage.message}`
      : `Error: ${data.errorMessage.message}`;
    return errorMsg;
  }

  const arrivals = data.realtimeArrivalList;
  if (!arrivals || arrivals.length === 0) {
    return lang === 'ko'
      ? `[${stationKo}]\n\n도착 정보가 없습니다.`
      : `[${getEnglishName(stationKo) || stationKo}]\n\nNo arrival information available.`;
  }

  // Build header
  const stationEn = getEnglishName(stationKo);
  const header = lang === 'ko'
    ? `[${stationKo}역 ${stationEn || ''}]`
    : `[${stationEn || stationKo} Station ${stationKo}역]`;

  // Table headers
  const tableHeaders = lang === 'ko'
    ? ['호선', '방향', '도착', '위치', '유형']
    : ['Line', 'Direction', 'Arrival', 'Location', 'Type'];

  // Build rows
  const rows: string[][] = arrivals.map(arrival => {
    const emoji = getLineEmoji(arrival.subwayId);
    const lineShort = getLineShort(arrival.subwayId);
    const direction = formatDirection(arrival, lang);
    const arrivalTime = parseArrivalMessage(arrival.arvlMsg2, lang);
    const location = formatLocation(arrival, lang);
    const trainType = getTrainType(arrival, lang);

    return [
      `${emoji} ${lineShort}`,
      direction,
      arrivalTime,
      location,
      trainType,
    ];
  });

  const table = createMarkdownTable(tableHeaders, rows);

  return `${header}\n\n${table}`;
}
