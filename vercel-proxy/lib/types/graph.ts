/**
 * 서울 지하철 자체 경로 탐색을 위한 그래프 타입 정의
 */

/** 지하철 노선 식별자 */
export type LineId =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'AREX' // 공항철도
  | 'SBD' // 신분당선 (Sinbundang)
  | 'GJ' // 경의중앙선 (Gyeongui-Jungang)
  | 'SB' // 수인분당선 (Suin-Bundang)
  | 'UI' // 우이신설선
  | 'SL'; // 신림선

/** 역 정보 */
export interface Station {
  /** 고유 ID (예: 'L02_217' = 2호선 강남) */
  id: string;
  /** 역명 (한글) */
  name: string;
  /** 역명 (영문) */
  nameEn?: string;
  /** 노선 ID */
  line: LineId;
  /** 역 코드 (노선 내 번호) */
  code: string;
  /** 서울교통공사 관할 여부 */
  isSeoulMetro: boolean;
}

/** 역간 연결 (엣지) */
export interface Edge {
  /** 출발역 ID */
  from: string;
  /** 도착역 ID */
  to: string;
  /** 노선 ID */
  line: LineId;
  /** 소요 시간 (초) - 기본 120초 */
  travelTime: number;
}

/** 환승역 그룹 */
export interface TransferGroup {
  /** 환승역명 */
  name: string;
  /** 환승 가능한 역 ID 목록 */
  stations: string[];
  /** 환승 소요 시간 (초) */
  walkTime: number;
}

/** 그래프 노드 (Dijkstra 알고리즘용) */
export interface GraphNode {
  /** 역 ID */
  stationId: string;
  /** 인접 노드 목록 */
  neighbors: Array<{
    stationId: string;
    weight: number; // 소요 시간 (초)
    isTransfer: boolean;
    line?: LineId;
  }>;
}

/** 경로 탐색 결과 */
export interface PathResult {
  /** 출발역 */
  departure: Station;
  /** 도착역 */
  arrival: Station;
  /** 경로 상의 역 목록 */
  path: Station[];
  /** 총 소요 시간 (초) */
  totalTime: number;
  /** 환승 횟수 */
  transferCount: number;
  /** 환승 정보 */
  transfers: TransferInfo[];
  /** 총 정거장 수 */
  stationCount: number;
  /** 예상 요금 (원) */
  fare: number;
}

/** 환승 정보 */
export interface TransferInfo {
  /** 환승역명 */
  stationName: string;
  /** 출발 노선 */
  fromLine: LineId;
  /** 도착 노선 */
  toLine: LineId;
  /** 환승 소요 시간 (초) */
  walkTime: number;
}

/** 노선 데이터 (역 순서 목록) */
export interface LineData {
  /** 노선 ID */
  id: LineId;
  /** 노선명 (한글) */
  name: string;
  /** 노선명 (영문) */
  nameEn: string;
  /** 역 목록 (순서대로) */
  stations: Array<{
    code: string;
    name: string;
    nameEn?: string;
  }>;
  /** 순환선 여부 (2호선 본선) */
  isCircular?: boolean;
  /** 서울교통공사 관할 여부 */
  isSeoulMetro: boolean;
}

/** 그래프 데이터 전체 */
export interface GraphData {
  stations: Map<string, Station>;
  edges: Edge[];
  transfers: TransferGroup[];
}

/** 경로 탐색용 우선순위 큐 아이템 */
export interface PriorityQueueItem {
  stationId: string;
  distance: number;
  previousStation: string | null;
  previousLine: LineId | null;
}
