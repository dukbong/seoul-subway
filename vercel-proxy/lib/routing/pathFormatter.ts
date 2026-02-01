/**
 * 경로 결과 포맷터
 * 자체 경로 탐색 결과를 기존 API 응답 형식과 호환되도록 변환
 */
import type { PathResult, Station, LineId } from '../types/graph.js';
import { calculateFare, formatFare, formatFareEn } from './fareCalculator.js';

/** 노선별 색상 매핑 */
const LINE_COLORS: Record<LineId, string> = {
  '1': '#0052A4',
  '2': '#00A84D',
  '3': '#EF7C1C',
  '4': '#00A5DE',
  '5': '#996CAC',
  '6': '#CD7C2F',
  '7': '#747F00',
  '8': '#E6186C',
  '9': '#BDB092',
  AREX: '#0065B3',
  SBD: '#D4003B',
  GJ: '#77C4A3',
  SB: '#FABE00',
  UI: '#B7C450',
  SL: '#6789CA',
};

/** 노선명 매핑 */
const LINE_NAMES: Record<LineId, { ko: string; en: string }> = {
  '1': { ko: '1호선', en: 'Line 1' },
  '2': { ko: '2호선', en: 'Line 2' },
  '3': { ko: '3호선', en: 'Line 3' },
  '4': { ko: '4호선', en: 'Line 4' },
  '5': { ko: '5호선', en: 'Line 5' },
  '6': { ko: '6호선', en: 'Line 6' },
  '7': { ko: '7호선', en: 'Line 7' },
  '8': { ko: '8호선', en: 'Line 8' },
  '9': { ko: '9호선', en: 'Line 9' },
  AREX: { ko: '공항철도', en: 'Airport Railroad' },
  SBD: { ko: '신분당선', en: 'Sinbundang Line' },
  GJ: { ko: '경의중앙선', en: 'Gyeongui-Jungang Line' },
  SB: { ko: '수인분당선', en: 'Suin-Bundang Line' },
  UI: { ko: '우이신설선', en: 'Ui-Sinseol Line' },
  SL: { ko: '신림선', en: 'Sillim Line' },
};

/** 경로 구간 정보 */
interface RouteSegment {
  line: LineId;
  lineName: string;
  lineNameEn: string;
  lineColor: string;
  stations: Array<{
    name: string;
    nameEn?: string;
  }>;
  startStation: string;
  endStation: string;
  stationCount: number;
  duration: number; // 초
}

/**
 * PathResult를 경로 구간별로 분할
 */
function segmentPath(result: PathResult): RouteSegment[] {
  const segments: RouteSegment[] = [];
  let currentSegment: RouteSegment | null = null;

  for (const station of result.path) {
    const lineInfo = LINE_NAMES[station.line] || { ko: station.line, en: station.line };

    if (!currentSegment || currentSegment.line !== station.line) {
      // 새로운 구간 시작
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = {
        line: station.line,
        lineName: lineInfo.ko,
        lineNameEn: lineInfo.en,
        lineColor: LINE_COLORS[station.line] || '#888888',
        stations: [],
        startStation: station.name,
        endStation: station.name,
        stationCount: 0,
        duration: 0,
      };
    }

    currentSegment.stations.push({
      name: station.name,
      nameEn: station.nameEn,
    });
    currentSegment.endStation = station.name;
    currentSegment.stationCount = currentSegment.stations.length;
    currentSegment.duration = currentSegment.stationCount * 120; // 역당 2분
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * 시간을 분:초 형식으로 포맷팅
 */
function formatDuration(seconds: number): { ko: string; en: string } {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (secs === 0) {
    return {
      ko: `${minutes}분`,
      en: `${minutes} min`,
    };
  }

  return {
    ko: `${minutes}분 ${secs}초`,
    en: `${minutes} min ${secs} sec`,
  };
}

/**
 * 경로 결과를 한글 응답으로 포맷팅
 */
export function formatPathResultKo(result: PathResult): string {
  const segments = segmentPath(result);
  const fare = calculateFare(result);
  const duration = formatDuration(result.totalTime);

  let output = '';

  // 헤더
  output += `📍 **${result.departure.name}** → **${result.arrival.name}**\n\n`;

  // 요약 정보
  output += `⏱️ 소요 시간: ${duration.ko}\n`;
  output += `🚉 정거장: ${result.stationCount}개역\n`;
  output += `🔄 환승: ${result.transferCount}회\n`;
  output += `💰 예상 요금: ${formatFare(fare)}\n\n`;

  // 경로 상세
  output += `**경로 상세**\n\n`;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;
    const segmentDuration = formatDuration(segment.duration);

    output += `**${i + 1}. ${segment.lineName}** (${segment.stationCount}개역, ${segmentDuration.ko})\n`;
    output += `   ${segment.startStation} → ${segment.endStation}\n`;

    // 환승 정보
    const nextSegment = segments[i + 1];
    if (i < segments.length - 1 && nextSegment) {
      output += `   🔄 ${segment.endStation}에서 ${nextSegment.lineName}으로 환승\n`;
    }

    output += '\n';
  }

  return output;
}

/**
 * 경로 결과를 영어 응답으로 포맷팅
 */
export function formatPathResultEn(result: PathResult): string {
  const segments = segmentPath(result);
  const fare = calculateFare(result);
  const duration = formatDuration(result.totalTime);

  let output = '';

  // Header
  output += `📍 **${result.departure.nameEn || result.departure.name}** → **${result.arrival.nameEn || result.arrival.name}**\n\n`;

  // Summary
  output += `⏱️ Duration: ${duration.en}\n`;
  output += `🚉 Stations: ${result.stationCount}\n`;
  output += `🔄 Transfers: ${result.transferCount}\n`;
  output += `💰 Estimated Fare: ${formatFareEn(fare)}\n\n`;

  // Route Details
  output += `**Route Details**\n\n`;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;
    const segmentDuration = formatDuration(segment.duration);

    const firstStation = segment.stations[0];
    const lastStation = segment.stations[segment.stations.length - 1];
    const startName = firstStation?.nameEn || segment.startStation;
    const endName = lastStation?.nameEn || segment.endStation;

    output += `**${i + 1}. ${segment.lineNameEn}** (${segment.stationCount} stations, ${segmentDuration.en})\n`;
    output += `   ${startName} → ${endName}\n`;

    // Transfer info
    const nextSegment = segments[i + 1];
    if (i < segments.length - 1 && nextSegment) {
      const transferStation = lastStation?.nameEn || segment.endStation;
      output += `   🔄 Transfer to ${nextSegment.lineNameEn} at ${transferStation}\n`;
    }

    output += '\n';
  }

  return output;
}

/**
 * 경로 결과를 JSON 응답으로 변환
 */
export function formatPathResultJson(result: PathResult): object {
  const segments = segmentPath(result);
  const fare = calculateFare(result);

  return {
    departure: {
      name: result.departure.name,
      nameEn: result.departure.nameEn,
      line: result.departure.line,
    },
    arrival: {
      name: result.arrival.name,
      nameEn: result.arrival.nameEn,
      line: result.arrival.line,
    },
    totalTime: result.totalTime,
    totalTimeMinutes: Math.ceil(result.totalTime / 60),
    stationCount: result.stationCount,
    transferCount: result.transferCount,
    fare,
    segments: segments.map((seg) => ({
      line: seg.line,
      lineName: seg.lineName,
      lineNameEn: seg.lineNameEn,
      lineColor: seg.lineColor,
      startStation: seg.startStation,
      endStation: seg.endStation,
      stationCount: seg.stationCount,
      duration: seg.duration,
      stations: seg.stations,
    })),
    transfers: result.transfers.map((t) => ({
      stationName: t.stationName,
      fromLine: t.fromLine,
      toLine: t.toLine,
      walkTime: t.walkTime,
    })),
    path: result.path.map((station) => ({
      name: station.name,
      nameEn: station.nameEn,
      line: station.line,
    })),
  };
}

export default {
  formatPathResultKo,
  formatPathResultEn,
  formatPathResultJson,
};
