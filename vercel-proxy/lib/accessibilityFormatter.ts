/**
 * Accessibility information formatter
 */

import type {
  AccessibilityInfo,
  ElevatorLocationInfo,
  EscalatorLocationInfo,
  WheelchairLiftInfo,
  QuickExitInfo,
  QuickExitData,
} from './types/index.js';
import { type Language, createMarkdownTable } from './formatter.js';

/**
 * Format operation status
 */
function formatOperationStatus(status: string, lang: Language): string {
  const statusMap: Record<string, { ko: string; en: string }> = {
    M: { ko: '🟢 정상', en: '🟢 Normal' },
    정상: { ko: '🟢 정상', en: '🟢 Normal' },
    S: { ko: '🔴 고장', en: '🔴 Out of order' },
    고장: { ko: '🔴 고장', en: '🔴 Out of order' },
    P: { ko: '🟡 점검', en: '🟡 Maintenance' },
    점검: { ko: '🟡 점검', en: '🟡 Maintenance' },
  };
  const mapped = statusMap[status];
  if (mapped) return lang === 'ko' ? mapped.ko : mapped.en;
  return status || '-';
}

/**
 * Format elevator locations to markdown table
 */
function formatElevators(
  elevators: ElevatorLocationInfo[],
  lang: Language
): string {
  if (elevators.length === 0) {
    return lang === 'ko' ? '엘리베이터 정보가 없습니다.' : 'No elevator information available.';
  }

  const headers = lang === 'ko'
    ? ['호선', '위치', '층', '상태']
    : ['Line', 'Location', 'Floor', 'Status'];

  const rows = elevators.map(e => [
    e.lineNm || '-',
    e.dtlPstn || e.vcntEntrcNo || '-',
    `${e.bgngFlrGrndUdgdSe || ''} ${e.bgngFlr || ''} → ${e.endFlrGrndUdgdSe || ''} ${e.endFlr || ''}`.trim() || '-',
    formatOperationStatus(e.oprtngSitu, lang),
  ]);

  return createMarkdownTable(headers, rows);
}

/**
 * Format escalator locations to markdown table
 */
function formatEscalators(
  escalators: EscalatorLocationInfo[],
  lang: Language
): string {
  if (escalators.length === 0) {
    return lang === 'ko' ? '에스컬레이터 정보가 없습니다.' : 'No escalator information available.';
  }

  const headers = lang === 'ko'
    ? ['호선', '위치', '층', '상태']
    : ['Line', 'Location', 'Floor', 'Status'];

  const rows = escalators.map(e => [
    e.lineNm || '-',
    e.dtlPstn || e.vcntEntrcNo || '-',
    `${e.bgngFlrGrndUdgdSe || ''} ${e.bgngFlr || ''} → ${e.endFlrGrndUdgdSe || ''} ${e.endFlr || ''}`.trim() || '-',
    formatOperationStatus(e.oprtngSitu, lang),
  ]);

  return createMarkdownTable(headers, rows);
}

/**
 * Format wheelchair lifts to markdown table
 */
function formatWheelchairLifts(
  lifts: WheelchairLiftInfo[],
  lang: Language
): string {
  if (lifts.length === 0) {
    return lang === 'ko' ? '휠체어리프트 정보가 없습니다.' : 'No wheelchair lift information available.';
  }

  const headers = lang === 'ko'
    ? ['호선', '위치', '상태']
    : ['Line', 'Location', 'Status'];

  const rows = lifts.map(l => [
    l.lineNm || '-',
    l.dtlPstn || '-',
    formatOperationStatus(l.oprtngSitu, lang),
  ]);

  return createMarkdownTable(headers, rows);
}

/**
 * Format complete accessibility info to markdown
 */
export function formatAccessibilityInfo(
  data: AccessibilityInfo,
  lang: Language,
  type: 'elevator' | 'escalator' | 'wheelchair' | 'all' = 'all'
): string {
  const header = lang === 'ko'
    ? `[${data.station}역 접근성 정보${data.stationEn ? ` ${data.stationEn}` : ''}]`
    : `[${data.stationEn || data.station} Station Accessibility ${data.station}역]`;

  const sections: string[] = [header];

  if (type === 'all' || type === 'elevator') {
    const elevatorTitle = lang === 'ko' ? '### 🛗 엘리베이터' : '### 🛗 Elevators';
    sections.push('');
    sections.push(elevatorTitle);
    sections.push('');
    sections.push(formatElevators(data.elevators, lang));
  }

  if (type === 'all' || type === 'escalator') {
    const escalatorTitle = lang === 'ko' ? '### ↗️ 에스컬레이터' : '### ↗️ Escalators';
    sections.push('');
    sections.push(escalatorTitle);
    sections.push('');
    sections.push(formatEscalators(data.escalators, lang));
  }

  if (type === 'all' || type === 'wheelchair') {
    const wheelchairTitle = lang === 'ko' ? '### ♿ 휠체어리프트' : '### ♿ Wheelchair Lifts';
    sections.push('');
    sections.push(wheelchairTitle);
    sections.push('');
    sections.push(formatWheelchairLifts(data.wheelchairLifts, lang));
  }

  return sections.join('\n');
}

/**
 * Format quick exit info to markdown table
 */
export function formatQuickExitInfo(
  data: QuickExitData,
  lang: Language,
  facility: 'elevator' | 'escalator' | 'exit' | 'all' = 'all'
): string {
  const header = lang === 'ko'
    ? `[${data.station}역 빠른하차 정보${data.stationEn ? ` ${data.stationEn}` : ''}]`
    : `[${data.stationEn || data.station} Station Quick Exit ${data.station}역]`;

  if (data.quickExits.length === 0) {
    const noData = lang === 'ko'
      ? '빠른하차 정보가 없습니다.'
      : 'No quick exit information available.';
    return `${header}\n\n${noData}`;
  }

  // Filter by facility if specified
  let filtered = data.quickExits;
  if (facility !== 'all') {
    filtered = data.quickExits.filter(q => {
      if (facility === 'elevator') return q.elvtrNo && q.elvtrNo !== '';
      if (facility === 'escalator') return q.esctrNo && q.esctrNo !== '';
      if (facility === 'exit') return q.exitNo && q.exitNo !== '';
      return true;
    });
  }

  if (filtered.length === 0) {
    const noData = lang === 'ko'
      ? '해당 시설의 빠른하차 정보가 없습니다.'
      : 'No quick exit information for this facility.';
    return `${header}\n\n${noData}`;
  }

  const headers = lang === 'ko'
    ? ['호선', '방향', '칸', '출구', '계단', '엘리베이터', '에스컬레이터']
    : ['Line', 'Direction', 'Car', 'Exit', 'Stairs', 'Elevator', 'Escalator'];

  const rows = filtered.map(q => [
    q.lineNm || '-',
    q.drtn || '-',
    q.fstCarNo || '-',
    q.exitNo || '-',
    q.stairNo || '-',
    q.elvtrNo || '-',
    q.esctrNo || '-',
  ]);

  const table = createMarkdownTable(headers, rows);

  return `${header}\n\n${table}`;
}
