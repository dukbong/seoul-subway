/**
 * 역간 연결 (엣지) 데이터
 * 각 노선의 인접한 역들을 연결하고 소요 시간 정의
 */
import type { Edge, LineId, LineData } from '../../lib/types/graph.js';
import { createStationId } from './stations.js';
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

/** 기본 역간 소요 시간 (초) */
const DEFAULT_TRAVEL_TIME = 120; // 2분

/** 공항철도 역간 소요 시간 (초) - 역간 거리가 길어 더 김 */
const AREX_TRAVEL_TIME = 180; // 3분

/**
 * 노선 데이터에서 엣지 생성
 * 인접한 역들을 양방향으로 연결
 */
function createEdgesFromLine(lineData: LineData, line: LineId, travelTime: number = DEFAULT_TRAVEL_TIME): Edge[] {
  const edges: Edge[] = [];
  const stations = lineData.stations;

  for (let i = 0; i < stations.length - 1; i++) {
    const fromStation = stations[i];
    const toStation = stations[i + 1];
    if (!fromStation || !toStation) continue;

    const fromId = createStationId(line, fromStation.code);
    const toId = createStationId(line, toStation.code);

    // 양방향 엣지 생성
    edges.push({
      from: fromId,
      to: toId,
      line,
      travelTime,
    });
    edges.push({
      from: toId,
      to: fromId,
      line,
      travelTime,
    });
  }

  // 순환선인 경우 마지막 역과 첫 역 연결
  if (lineData.isCircular && stations.length > 2) {
    const firstStation = stations[0];
    const lastStation = stations[stations.length - 1];
    if (!firstStation || !lastStation) return edges;

    const firstId = createStationId(line, firstStation.code);
    const lastId = createStationId(line, lastStation.code);

    edges.push({
      from: lastId,
      to: firstId,
      line,
      travelTime,
    });
    edges.push({
      from: firstId,
      to: lastId,
      line,
      travelTime,
    });
  }

  return edges;
}

/** 1호선 분기점 연결 (구로역 기준) */
function create1LineJunctions(): Edge[] {
  const edges: Edge[] = [];
  const guroId = createStationId('1', '141'); // 구로

  // 구로 → 가산디지털단지 (경부선)
  const gasanId = createStationId('1', 'P141');
  edges.push({ from: guroId, to: gasanId, line: '1', travelTime: DEFAULT_TRAVEL_TIME });
  edges.push({ from: gasanId, to: guroId, line: '1', travelTime: DEFAULT_TRAVEL_TIME });

  // 구로 → 광명 (광명지선)
  const gwangmyeongId = createStationId('1', '144-1');
  edges.push({ from: guroId, to: gwangmyeongId, line: '1', travelTime: 180 }); // 3분
  edges.push({ from: gwangmyeongId, to: guroId, line: '1', travelTime: 180 });

  return edges;
}

/** 5호선 분기점 연결 (강동역 기준) */
function create5LineJunctions(): Edge[] {
  const edges: Edge[] = [];
  const gangdongId = createStationId('5', '548'); // 강동

  // 강동 → 둔촌동 (마천지선)
  const dunchonId = createStationId('5', 'P548-1');
  edges.push({ from: gangdongId, to: dunchonId, line: '5', travelTime: DEFAULT_TRAVEL_TIME });
  edges.push({ from: dunchonId, to: gangdongId, line: '5', travelTime: DEFAULT_TRAVEL_TIME });

  return edges;
}

/** 6호선 응암순환 연결 */
function create6LineCircular(): Edge[] {
  const edges: Edge[] = [];

  // 구산(615) → 새절(610-1) 연결
  const gusanId = createStationId('6', '615');
  const saejeolId = createStationId('6', '610-1');
  edges.push({ from: gusanId, to: saejeolId, line: '6', travelTime: DEFAULT_TRAVEL_TIME });
  edges.push({ from: saejeolId, to: gusanId, line: '6', travelTime: DEFAULT_TRAVEL_TIME });

  // 응암(610) → 새절(610-1) 연결 (순환)
  const eungamId = createStationId('6', '610');
  edges.push({ from: eungamId, to: saejeolId, line: '6', travelTime: DEFAULT_TRAVEL_TIME });
  edges.push({ from: saejeolId, to: eungamId, line: '6', travelTime: DEFAULT_TRAVEL_TIME });

  return edges;
}

/** 전체 엣지 생성 */
function buildEdges(): Edge[] {
  const edges: Edge[] = [];

  // 1-9호선 엣지 생성
  edges.push(...createEdgesFromLine(line1, '1'));
  edges.push(...createEdgesFromLine(line1Gyeongbu, '1'));
  // 광명지선은 분기점 처리로 대체
  edges.push(...createEdgesFromLine(line2, '2'));
  edges.push(...createEdgesFromLine(line2Seongsu, '2'));
  edges.push(...createEdgesFromLine(line2Sinjeong, '2'));
  edges.push(...createEdgesFromLine(line3, '3'));
  edges.push(...createEdgesFromLine(line4, '4'));
  edges.push(...createEdgesFromLine(line5, '5'));
  edges.push(...createEdgesFromLine(line5Macheon, '5'));
  edges.push(...createEdgesFromLine(line6, '6'));
  edges.push(...createEdgesFromLine(line7, '7'));
  edges.push(...createEdgesFromLine(line8, '8'));
  edges.push(...createEdgesFromLine(line9, '9'));

  // 타사 노선 엣지 생성
  edges.push(...createEdgesFromLine(arex, 'AREX', AREX_TRAVEL_TIME));
  edges.push(...createEdgesFromLine(shinbundang, 'SBD'));
  edges.push(...createEdgesFromLine(gyeonguiJungang, 'GJ'));
  edges.push(...createEdgesFromLine(suinBundang, 'SB'));

  // 분기점 연결
  edges.push(...create1LineJunctions());
  edges.push(...create5LineJunctions());
  edges.push(...create6LineCircular());

  return edges;
}

/** 전체 엣지 데이터 */
export const edges = buildEdges();

/** 특정 역에서 출발하는 엣지 검색 */
export function getEdgesFrom(stationId: string): Edge[] {
  return edges.filter((e) => e.from === stationId);
}

/** 특정 역에 도착하는 엣지 검색 */
export function getEdgesTo(stationId: string): Edge[] {
  return edges.filter((e) => e.to === stationId);
}

export default edges;
