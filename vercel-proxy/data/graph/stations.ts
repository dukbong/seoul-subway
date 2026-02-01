/**
 * 전체 역 데이터 통합
 * 노선별 데이터에서 역 정보를 추출하여 Map으로 구성
 */
import type { Station, LineId } from '../../lib/types/graph.js';
import {
  line1,
  line1Gwangmyeong,
  line1Gyeongbu,
  line2,
  line2Seongsu,
  line2Sinjeong,
  line3,
  line4,
  line5,
  line5Macheon,
  line6,
  line7,
  line8,
  line9,
  arex,
  shinbundang,
  gyeonguiJungang,
  suinBundang,
} from './lines/index.js';

/**
 * 역 ID 생성 함수
 * @param line 노선 ID
 * @param code 역 코드
 * @returns 예: 'L02_222' (2호선 강남)
 */
export function createStationId(line: LineId, code: string): string {
  const linePrefix = line.length === 1 ? `L0${line}` : line;
  return `${linePrefix}_${code}`;
}

/** 전체 역 Map 생성 */
function buildStationsMap(): Map<string, Station> {
  const stations = new Map<string, Station>();

  const lineDataList = [
    { data: line1, line: '1' as LineId },
    { data: line1Gwangmyeong, line: '1' as LineId },
    { data: line1Gyeongbu, line: '1' as LineId },
    { data: line2, line: '2' as LineId },
    { data: line2Seongsu, line: '2' as LineId },
    { data: line2Sinjeong, line: '2' as LineId },
    { data: line3, line: '3' as LineId },
    { data: line4, line: '4' as LineId },
    { data: line5, line: '5' as LineId },
    { data: line5Macheon, line: '5' as LineId },
    { data: line6, line: '6' as LineId },
    { data: line7, line: '7' as LineId },
    { data: line8, line: '8' as LineId },
    { data: line9, line: '9' as LineId },
    // 타사 노선
    { data: arex, line: 'AREX' as LineId },
    { data: shinbundang, line: 'SBD' as LineId },
    { data: gyeonguiJungang, line: 'GJ' as LineId },
    { data: suinBundang, line: 'SB' as LineId },
  ];

  for (const { data, line } of lineDataList) {
    for (const station of data.stations) {
      const id = createStationId(line, station.code);
      // 중복 역은 스킵 (환승역은 각 노선별로 별도 ID)
      if (!stations.has(id)) {
        stations.set(id, {
          id,
          name: station.name,
          nameEn: station.nameEn,
          line,
          code: station.code,
          isSeoulMetro: data.isSeoulMetro,
        });
      }
    }
  }

  return stations;
}

/** 전체 역 데이터 */
export const stationsMap = buildStationsMap();

/** 역명으로 역 검색 (동일 이름의 여러 노선 역 반환) */
export function findStationsByName(name: string): Station[] {
  const result: Station[] = [];
  for (const station of stationsMap.values()) {
    if (station.name === name || station.nameEn?.toLowerCase() === name.toLowerCase()) {
      result.push(station);
    }
  }
  return result;
}

/** 역 ID로 역 검색 */
export function getStationById(id: string): Station | undefined {
  return stationsMap.get(id);
}

/** 노선별 역 목록 반환 */
export function getStationsByLine(line: LineId): Station[] {
  const result: Station[] = [];
  for (const station of stationsMap.values()) {
    if (station.line === line) {
      result.push(station);
    }
  }
  return result;
}

export default stationsMap;
