/**
 * Restroom information formatter
 */

import type { RestroomInfo, RestroomData } from './types/index.js';
import { type Language, createMarkdownTable } from './formatter.js';

/**
 * Format gate location
 */
function formatGateLocation(location: string, lang: Language): string {
  if (location === '내부' || location === '1') return lang === 'ko' ? '개찰구 내' : 'Inside gate';
  if (location === '외부' || location === '2') return lang === 'ko' ? '개찰구 외' : 'Outside gate';
  return location || '-';
}

/**
 * Format toilet counts
 */
function formatToiletCounts(restroom: RestroomInfo, lang: Language): string {
  const parts: string[] = [];

  if (restroom.mlsexToiletInnb) {
    const count = restroom.mlsexToiletInnb;
    parts.push(lang === 'ko' ? `남 ${count}` : `M:${count}`);
  }
  if (restroom.mlsexUrinInnb) {
    const count = restroom.mlsexUrinInnb;
    parts.push(lang === 'ko' ? `(소 ${count})` : `(U:${count})`);
  }
  if (restroom.wmsexToiletInnb) {
    const count = restroom.wmsexToiletInnb;
    parts.push(lang === 'ko' ? `여 ${count}` : `W:${count}`);
  }
  if (restroom.dspsnToiletInnb) {
    const count = restroom.dspsnToiletInnb;
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
    ? ['호선', '위치', '층', '개찰구', '변기수', '기저귀교환대']
    : ['Line', 'Location', 'Floor', 'Gate', 'Toilets', 'Baby Station'];

  const rows = data.restrooms.map(r => [
    r.lineNm || '-',
    r.dtlPstn || '-',
    `${r.grndUdgdSe || ''} ${r.flr || ''}`.trim() || '-',
    formatGateLocation(r.gateInotrSe, lang),
    formatToiletCounts(r, lang),
    formatBabyChanging(r.babyChngSttus, lang),
  ]);

  const table = createMarkdownTable(tableHeaders, rows);

  // Add summary
  const totalRestrooms = data.restrooms.length;
  const insideGate = data.restrooms.filter(r => r.gateInotrSe === '내부' || r.gateInotrSe === '1').length;
  const outsideGate = data.restrooms.filter(r => r.gateInotrSe === '외부' || r.gateInotrSe === '2').length;
  const accessible = data.restrooms.filter(r => r.dspsnToiletInnb && r.dspsnToiletInnb > 0).length;
  const hasBabyStation = data.restrooms.some(r =>
    r.babyChngSttus === 'Y' || r.babyChngSttus === '1' || r.babyChngSttus === '있음'
  );

  const summary = lang === 'ko'
    ? `\n\n**요약:** 총 ${totalRestrooms}개 | 개찰구 내 ${insideGate}개 | 개찰구 외 ${outsideGate}개 | 장애인화장실 ${accessible}개 | 기저귀교환대 ${hasBabyStation ? '있음' : '없음'}`
    : `\n\n**Summary:** Total ${totalRestrooms} | Inside gate: ${insideGate} | Outside gate: ${outsideGate} | Accessible: ${accessible} | Baby station: ${hasBabyStation ? 'Yes' : 'No'}`;

  return `${header}\n\n${table}${summary}`;
}
