/**
 * Common formatting utilities for Seoul Subway API
 */

export type Language = 'ko' | 'en';

/**
 * Line color emoji mapping by subwayId
 */
export const LINE_COLORS: Record<string, string> = {
  '1001': '🔵', // Line 1 - Blue
  '1002': '🟢', // Line 2 - Green
  '1003': '🟠', // Line 3 - Orange
  '1004': '🔵', // Line 4 - Light Blue
  '1005': '🟣', // Line 5 - Purple
  '1006': '🟤', // Line 6 - Brown
  '1007': '🟢', // Line 7 - Olive
  '1008': '🔴', // Line 8 - Pink
  '1009': '🟡', // Line 9 - Gold
  '1063': '🔵', // Gyeongui-Jungang - Cyan
  '1065': '🔵', // Airport Railroad - Blue
  '1067': '🟢', // Gyeongchun Line - Green
  '1075': '🟡', // Suin-Bundang - Yellow
  '1077': '🔴', // Sinbundang - Red
};

/**
 * Line name mapping (Korean and English)
 */
export const LINE_NAMES: Record<string, { ko: string; en: string; short: string }> = {
  '1001': { ko: '1호선', en: 'Line 1', short: '1' },
  '1002': { ko: '2호선', en: 'Line 2', short: '2' },
  '1003': { ko: '3호선', en: 'Line 3', short: '3' },
  '1004': { ko: '4호선', en: 'Line 4', short: '4' },
  '1005': { ko: '5호선', en: 'Line 5', short: '5' },
  '1006': { ko: '6호선', en: 'Line 6', short: '6' },
  '1007': { ko: '7호선', en: 'Line 7', short: '7' },
  '1008': { ko: '8호선', en: 'Line 8', short: '8' },
  '1009': { ko: '9호선', en: 'Line 9', short: '9' },
  '1063': { ko: '경의중앙선', en: 'Gyeongui-Jungang', short: '경의' },
  '1065': { ko: '공항철도', en: 'Airport Railroad', short: '공항' },
  '1067': { ko: '경춘선', en: 'Gyeongchun', short: '경춘' },
  '1075': { ko: '수인분당선', en: 'Suin-Bundang', short: '수분' },
  '1077': { ko: '신분당선', en: 'Sinbundang', short: '신분' },
};

/**
 * Get line emoji by subwayId
 */
export function getLineEmoji(subwayId: string): string {
  return LINE_COLORS[subwayId] || '⚪';
}

/**
 * Get line name by subwayId and language
 */
export function getLineName(subwayId: string, lang: Language): string {
  const line = LINE_NAMES[subwayId];
  if (!line) return subwayId;
  return lang === 'ko' ? line.ko : line.en;
}

/**
 * Get short line name (for compact display)
 */
export function getLineShort(subwayId: string): string {
  return LINE_NAMES[subwayId]?.short || subwayId;
}

/**
 * Create a markdown table from headers and rows
 */
export function createMarkdownTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) {
    return '';
  }

  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `|${headers.map(() => '------').join('|')}|`;
  const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');

  return `${headerRow}\n${separatorRow}\n${dataRows}`;
}

/**
 * Format number with comma separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * Format distance in km
 */
export function formatDistance(meters: number, lang: Language): string {
  const km = meters / 1000;
  return lang === 'ko' ? `${km.toFixed(1)}km` : `${km.toFixed(1)} km`;
}

/**
 * Format fare in KRW
 */
export function formatFare(fare: number, lang: Language): string {
  return lang === 'ko' ? `${formatNumber(fare)}원` : `${formatNumber(fare)} KRW`;
}

/**
 * Format duration in minutes
 */
export function formatDuration(minutes: number, lang: Language): string {
  return lang === 'ko' ? `${minutes}분` : `${minutes} min`;
}

/**
 * Translate Korean line name to English
 * Example: "2호선" → "Line 2"
 */
export function translateLineName(lineNm: string, lang: Language): string {
  if (lang === 'ko') return lineNm;
  if (!lineNm) return '-';

  // 숫자 호선: "2호선" → "Line 2"
  const match = lineNm.match(/^(\d+)호선$/);
  if (match) return `Line ${match[1]}`;

  // 특수 노선 매핑
  const specialLines: Record<string, string> = {
    '경의중앙선': 'Gyeongui-Jungang',
    '경의선': 'Gyeongui',
    '중앙선': 'Jungang',
    '공항철도': 'Airport Railroad',
    '신분당선': 'Sinbundang',
    '수인분당선': 'Suin-Bundang',
    '분당선': 'Bundang',
    '수인선': 'Suin',
    '경춘선': 'Gyeongchun',
    '경강선': 'Gyeonggang',
    '서해선': 'Seohae',
    '우이신설선': 'Ui-Sinseol',
    '신림선': 'Sillim',
    '김포골드라인': 'Gimpo Goldline',
    '에버라인': 'Everline',
    '의정부경전철': 'Uijeongbu LRT',
    'GTX-A': 'GTX-A',
  };

  return specialLines[lineNm] || lineNm;
}
