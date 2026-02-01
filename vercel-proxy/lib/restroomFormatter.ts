/**
 * Restroom information formatter
 */

import type { RestroomInfo, RestroomData } from './types/index.js';
import { type Language, createMarkdownTable } from './formatter.js';

/**
 * Format ground code to readable text
 */
function formatGroundCode(code: string, lang: Language): string {
  if (code === '1') return lang === 'ko' ? '지상' : 'Above';
  if (code === '2') return lang === 'ko' ? '지하' : 'Under';
  return code;
}

/**
 * Format gate location
 */
function formatGateLocation(code: string, lang: Language): string {
  if (code === '1' || code === '내') return lang === 'ko' ? '개찰구 내' : 'Inside gate';
  if (code === '2' || code === '외') return lang === 'ko' ? '개찰구 외' : 'Outside gate';
  return code || '-';
}

/**
 * Format restroom type
 */
function formatRestroomType(type: string, lang: Language): string {
  const typeMap: Record<string, { ko: string; en: string }> = {
    '일반': { ko: '일반', en: 'General' },
    '장애인': { ko: '♿ 장애인', en: '♿ Accessible' },
    '여성전용': { ko: '🚺 여성전용', en: '🚺 Women only' },
    '비상': { ko: '⚠️ 비상', en: '⚠️ Emergency' },
  };
  const mapped = typeMap[type];
  if (mapped) return lang === 'ko' ? mapped.ko : mapped.en;
  return type || '-';
}

/**
 * Format toilet counts
 */
function formatToiletCounts(restroom: RestroomInfo, lang: Language): string {
  const parts: string[] = [];

  if (restroom.MLSEX_TOILET_INNB) {
    const count = restroom.MLSEX_TOILET_INNB;
    parts.push(lang === 'ko' ? `남 ${count}` : `M:${count}`);
  }
  if (restroom.MLSEX_URIN_INNB) {
    const count = restroom.MLSEX_URIN_INNB;
    parts.push(lang === 'ko' ? `(소 ${count})` : `(U:${count})`);
  }
  if (restroom.WMSEX_TOILET_INNB) {
    const count = restroom.WMSEX_TOILET_INNB;
    parts.push(lang === 'ko' ? `여 ${count}` : `W:${count}`);
  }
  if (restroom.DSPSN_TOILET_INNB) {
    const count = restroom.DSPSN_TOILET_INNB;
    parts.push(lang === 'ko' ? `♿ ${count}` : `♿:${count}`);
  }

  return parts.length > 0 ? parts.join(' ') : '-';
}

/**
 * Check if baby changing station is available
 */
function formatBabyChanging(status: string | undefined, lang: Language): string {
  if (!status) return '-';
  if (status === 'Y' || status === '1' || status === '있음') {
    return lang === 'ko' ? '👶 있음' : '👶 Yes';
  }
  return lang === 'ko' ? '없음' : 'No';
}

/**
 * Format restroom info to markdown table
 */
export function formatRestroomInfo(
  data: RestroomData,
  lang: Language
): string {
  const header = lang === 'ko'
    ? `[${data.station}역 화장실 정보${data.stationEn ? ` ${data.stationEn}` : ''}]`
    : `[${data.stationEn || data.station} Station Restrooms ${data.station}역]`;

  if (data.restrooms.length === 0) {
    const noData = lang === 'ko'
      ? '화장실 정보가 없습니다.'
      : 'No restroom information available.';
    return `${header}\n\n${noData}`;
  }

  const tableHeaders = lang === 'ko'
    ? ['호선', '위치', '층', '개찰구', '구분', '변기수', '기저귀교환대']
    : ['Line', 'Location', 'Floor', 'Gate', 'Type', 'Toilets', 'Baby Station'];

  const rows = data.restrooms.map(r => [
    r.SW_NM || '-',
    r.INSTL_PLACE || '-',
    `${formatGroundCode(r.GROUND_CD, lang)} ${r.INSTL_LT || ''}`,
    formatGateLocation(r.GATE_INOTR_SE, lang),
    formatRestroomType(r.RSTRM_SE, lang),
    formatToiletCounts(r, lang),
    formatBabyChanging(r.BABY_CHNG_STTUS, lang),
  ]);

  const table = createMarkdownTable(tableHeaders, rows);

  // Add summary
  const totalRestrooms = data.restrooms.length;
  const insideGate = data.restrooms.filter(r => r.GATE_INOTR_SE === '1' || r.GATE_INOTR_SE === '내').length;
  const outsideGate = data.restrooms.filter(r => r.GATE_INOTR_SE === '2' || r.GATE_INOTR_SE === '외').length;
  const accessible = data.restrooms.filter(r => r.DSPSN_TOILET_INNB && parseInt(r.DSPSN_TOILET_INNB) > 0).length;
  const hasBabyStation = data.restrooms.some(r =>
    r.BABY_CHNG_STTUS === 'Y' || r.BABY_CHNG_STTUS === '1' || r.BABY_CHNG_STTUS === '있음'
  );

  const summary = lang === 'ko'
    ? `\n\n**요약:** 총 ${totalRestrooms}개 | 개찰구 내 ${insideGate}개 | 개찰구 외 ${outsideGate}개 | 장애인화장실 ${accessible}개 | 기저귀교환대 ${hasBabyStation ? '있음' : '없음'}`
    : `\n\n**Summary:** Total ${totalRestrooms} | Inside gate: ${insideGate} | Outside gate: ${outsideGate} | Accessible: ${accessible} | Baby station: ${hasBabyStation ? 'Yes' : 'No'}`;

  return `${header}\n\n${table}${summary}`;
}
