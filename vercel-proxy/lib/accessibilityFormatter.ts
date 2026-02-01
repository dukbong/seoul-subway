/**
 * Accessibility information formatter
 */

import type {
  AccessibilityInfo,
  ElevatorLocationInfo,
  ElevatorOperationInfo,
  EscalatorLocationInfo,
  EscalatorOperationInfo,
  WheelchairLiftInfo,
  QuickExitInfo,
  QuickExitData,
} from './types/index.js';
import { type Language, createMarkdownTable } from './formatter.js';

/**
 * Format ground code to readable text
 */
function formatGroundCode(code: string, lang: Language): string {
  if (code === '1') return lang === 'ko' ? '지상' : 'Above ground';
  if (code === '2') return lang === 'ko' ? '지하' : 'Underground';
  return code;
}

/**
 * Format operation status
 */
function formatOperationStatus(status: string, lang: Language): string {
  const statusMap: Record<string, { ko: string; en: string }> = {
    정상: { ko: '🟢 정상', en: '🟢 Normal' },
    고장: { ko: '🔴 고장', en: '🔴 Out of order' },
    점검: { ko: '🟡 점검', en: '🟡 Maintenance' },
    운휴: { ko: '⚫ 운휴', en: '⚫ Not operating' },
  };
  const mapped = statusMap[status];
  if (mapped) return lang === 'ko' ? mapped.ko : mapped.en;
  return status;
}

/**
 * Format elevator locations to markdown table
 */
function formatElevatorLocations(
  elevators: ElevatorLocationInfo[],
  lang: Language
): string {
  if (elevators.length === 0) {
    return lang === 'ko' ? '엘리베이터 정보가 없습니다.' : 'No elevator information available.';
  }

  const headers = lang === 'ko'
    ? ['호선', '위치', '층', '구분']
    : ['Line', 'Location', 'Floor', 'Type'];

  const rows = elevators.map(e => [
    e.SW_NM || '-',
    e.INSTL_PLACE || '-',
    `${formatGroundCode(e.GROUND_CD, lang)} ${e.INSTL_LT || ''}`,
    e.ELVTR_SE || '-',
  ]);

  return createMarkdownTable(headers, rows);
}

/**
 * Format elevator operations with status
 */
function formatElevatorOperations(
  operations: ElevatorOperationInfo[],
  lang: Language
): string {
  if (operations.length === 0) {
    return '';
  }

  const headers = lang === 'ko'
    ? ['번호', '위치', '상태', '운영시간']
    : ['No.', 'Location', 'Status', 'Hours'];

  const rows = operations.map(e => {
    const hours = e.OPER_BGNG_TM && e.OPER_END_TM
      ? `${e.OPER_BGNG_TM} ~ ${e.OPER_END_TM}`
      : '-';
    return [
      e.ELVTR_NO || '-',
      e.INSTL_PLACE || '-',
      formatOperationStatus(e.OPER_STTUS, lang),
      hours,
    ];
  });

  return createMarkdownTable(headers, rows);
}

/**
 * Format escalator locations to markdown table
 */
function formatEscalatorLocations(
  escalators: EscalatorLocationInfo[],
  lang: Language
): string {
  if (escalators.length === 0) {
    return lang === 'ko' ? '에스컬레이터 정보가 없습니다.' : 'No escalator information available.';
  }

  const headers = lang === 'ko'
    ? ['호선', '위치', '층', '구분']
    : ['Line', 'Location', 'Floor', 'Type'];

  const rows = escalators.map(e => [
    e.SW_NM || '-',
    e.INSTL_PLACE || '-',
    `${formatGroundCode(e.GROUND_CD, lang)} ${e.INSTL_LT || ''}`,
    e.ESCTR_SE || '-',
  ]);

  return createMarkdownTable(headers, rows);
}

/**
 * Format escalator operations with status
 */
function formatEscalatorOperations(
  operations: EscalatorOperationInfo[],
  lang: Language
): string {
  if (operations.length === 0) {
    return '';
  }

  const headers = lang === 'ko'
    ? ['번호', '위치', '상태', '운영시간']
    : ['No.', 'Location', 'Status', 'Hours'];

  const rows = operations.map(e => {
    const hours = e.OPER_BGNG_TM && e.OPER_END_TM
      ? `${e.OPER_BGNG_TM} ~ ${e.OPER_END_TM}`
      : '-';
    return [
      e.ESCTR_NO || '-',
      e.INSTL_PLACE || '-',
      formatOperationStatus(e.OPER_STTUS, lang),
      hours,
    ];
  });

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
    ? ['호선', '번호', '위치', '상태']
    : ['Line', 'No.', 'Location', 'Status'];

  const rows = lifts.map(l => [
    l.SW_NM || '-',
    l.WHCLLIFT_NO || '-',
    l.INSTL_PLACE || '-',
    formatOperationStatus(l.OPER_STTUS, lang),
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
    sections.push(formatElevatorLocations(data.elevators.locations, lang));

    if (data.elevators.operations.length > 0) {
      const opTitle = lang === 'ko' ? '**운영 현황**' : '**Operation Status**';
      sections.push('');
      sections.push(opTitle);
      sections.push('');
      sections.push(formatElevatorOperations(data.elevators.operations, lang));
    }
  }

  if (type === 'all' || type === 'escalator') {
    const escalatorTitle = lang === 'ko' ? '### ↗️ 에스컬레이터' : '### ↗️ Escalators';
    sections.push('');
    sections.push(escalatorTitle);
    sections.push('');
    sections.push(formatEscalatorLocations(data.escalators.locations, lang));

    if (data.escalators.operations.length > 0) {
      const opTitle = lang === 'ko' ? '**운영 현황**' : '**Operation Status**';
      sections.push('');
      sections.push(opTitle);
      sections.push('');
      sections.push(formatEscalatorOperations(data.escalators.operations, lang));
    }
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
      if (facility === 'elevator') return q.ELVTR_NO && q.ELVTR_NO !== '';
      if (facility === 'escalator') return q.ESCTR_NO && q.ESCTR_NO !== '';
      if (facility === 'exit') return q.EXIT_NO && q.EXIT_NO !== '';
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
    q.SW_NM || '-',
    q.DRTN || '-',
    q.FST_CAR_NO || '-',
    q.EXIT_NO || '-',
    q.STAIR_NO || '-',
    q.ELVTR_NO || '-',
    q.ESCTR_NO || '-',
  ]);

  const table = createMarkdownTable(headers, rows);

  return `${header}\n\n${table}`;
}
