/**
 * 그래프 빌더
 * 역 데이터, 엣지, 환승 정보를 조합하여 경로 탐색용 그래프 생성
 */
import type { GraphNode, LineId } from '../types/graph.js';
import { stationsMap, edges, transfers, getTransferWalkTime } from '../../data/graph/index.js';

/** 그래프 (인접 리스트 형태) */
export type Graph = Map<string, GraphNode>;

/**
 * 전체 그래프 빌드
 * - 역간 연결 (엣지)
 * - 환승 연결
 */
export function buildGraph(): Graph {
  const graph: Graph = new Map();

  // 1. 모든 역에 대해 노드 초기화
  for (const [stationId] of stationsMap) {
    graph.set(stationId, {
      stationId,
      neighbors: [],
    });
  }

  // 2. 엣지 추가 (역간 연결)
  for (const edge of edges) {
    const node = graph.get(edge.from);
    if (node) {
      // 중복 체크
      const exists = node.neighbors.some(
        (n) => n.stationId === edge.to && n.line === edge.line
      );
      if (!exists) {
        node.neighbors.push({
          stationId: edge.to,
          weight: edge.travelTime,
          isTransfer: false,
          line: edge.line,
        });
      }
    }
  }

  // 3. 환승 연결 추가
  for (const transfer of transfers) {
    const transferStations = transfer.stations;

    // 환승 그룹 내 모든 역을 서로 연결
    for (let i = 0; i < transferStations.length; i++) {
      for (let j = i + 1; j < transferStations.length; j++) {
        const stationI = transferStations[i];
        const stationJ = transferStations[j];
        if (!stationI || !stationJ) continue;

        const walkTime = getTransferWalkTime(stationI, stationJ);

        // 양방향 환승 연결
        const node1 = graph.get(stationI);
        const node2 = graph.get(stationJ);

        if (node1 && node2) {
          // 중복 체크
          if (!node1.neighbors.some((n) => n.stationId === stationJ && n.isTransfer)) {
            node1.neighbors.push({
              stationId: stationJ,
              weight: walkTime,
              isTransfer: true,
            });
          }
          if (!node2.neighbors.some((n) => n.stationId === stationI && n.isTransfer)) {
            node2.neighbors.push({
              stationId: stationI,
              weight: walkTime,
              isTransfer: true,
            });
          }
        }
      }
    }
  }

  return graph;
}

/** 캐시된 그래프 인스턴스 */
let cachedGraph: Graph | null = null;

/**
 * 그래프 가져오기 (싱글톤 패턴)
 */
export function getGraph(): Graph {
  if (!cachedGraph) {
    cachedGraph = buildGraph();
  }
  return cachedGraph;
}

/**
 * 그래프 캐시 초기화 (테스트용)
 */
export function clearGraphCache(): void {
  cachedGraph = null;
}

/**
 * 역명으로 역 ID 찾기
 * 동일 역명에 여러 노선이 있을 경우 모든 역 ID 반환
 */
export function findStationIdsByName(name: string): string[] {
  const result: string[] = [];

  for (const [id, station] of stationsMap) {
    if (
      station.name === name ||
      station.name.includes(name) ||
      station.nameEn?.toLowerCase() === name.toLowerCase() ||
      station.nameEn?.toLowerCase().includes(name.toLowerCase())
    ) {
      result.push(id);
    }
  }

  return result;
}

/**
 * 역명으로 대표 역 ID 찾기 (첫 번째 매칭)
 */
export function findStationIdByName(name: string): string | null {
  for (const [id, station] of stationsMap) {
    if (
      station.name === name ||
      station.nameEn?.toLowerCase() === name.toLowerCase()
    ) {
      return id;
    }
  }

  // 부분 일치 검색
  for (const [id, station] of stationsMap) {
    if (
      station.name.includes(name) ||
      station.nameEn?.toLowerCase().includes(name.toLowerCase())
    ) {
      return id;
    }
  }

  return null;
}

/**
 * 노선이 서울교통공사 관할인지 확인
 */
export function isSeoulMetroLine(line: LineId): boolean {
  const seoulMetroLines: LineId[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return seoulMetroLines.includes(line);
}

/**
 * 역이 서울교통공사 관할인지 확인
 */
export function isSeoulMetroStation(stationId: string): boolean {
  const station = stationsMap.get(stationId);
  return station?.isSeoulMetro ?? false;
}
