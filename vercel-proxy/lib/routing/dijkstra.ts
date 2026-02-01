/**
 * Dijkstra 최단 경로 알고리즘
 * 가중치가 있는 그래프에서 출발점에서 도착점까지의 최단 경로 탐색
 */
import type { Station, PathResult, TransferInfo, LineId } from '../types/graph.js';
import { stationsMap } from '../../data/graph/index.js';
import { getGraph, findStationIdsByName, type Graph } from './graphBuilder.js';

/** 우선순위 큐 아이템 */
interface PQItem {
  stationId: string;
  distance: number;
  previousStation: string | null;
  currentLine: LineId | null;
}

/**
 * 간단한 최소 힙 우선순위 큐 구현
 */
class PriorityQueue {
  private heap: PQItem[] = [];

  push(item: PQItem): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): PQItem | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parentItem = this.heap[parentIndex];
      const currentItem = this.heap[index];
      if (!parentItem || !currentItem) break;
      if (parentItem.distance <= currentItem.distance) break;
      this.heap[parentIndex] = currentItem;
      this.heap[index] = parentItem;
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      const leftItem = this.heap[leftChild];
      const rightItem = this.heap[rightChild];
      const smallestItem = this.heap[smallest];
      if (!smallestItem) break;

      if (leftChild < length && leftItem && leftItem.distance < smallestItem.distance) {
        smallest = leftChild;
      }
      const newSmallestItem = this.heap[smallest];
      if (!newSmallestItem) break;

      if (rightChild < length && rightItem && rightItem.distance < newSmallestItem.distance) {
        smallest = rightChild;
      }
      if (smallest === index) break;

      const currentItem = this.heap[index];
      const swapItem = this.heap[smallest];
      if (!currentItem || !swapItem) break;
      this.heap[index] = swapItem;
      this.heap[smallest] = currentItem;
      index = smallest;
    }
  }
}

/** 경로 추적 정보 */
interface PathTraceInfo {
  previousStation: string | null;
  line: LineId | null;
  isTransfer: boolean;
}

/**
 * Dijkstra 알고리즘으로 최단 경로 탐색
 * @param startId 출발역 ID
 * @param endId 도착역 ID
 * @returns 경로 결과 또는 null (경로 없음)
 */
export function dijkstra(startId: string, endId: string): PathResult | null {
  const graph = getGraph();

  // 시작/도착 역 존재 확인
  if (!graph.has(startId) || !graph.has(endId)) {
    return null;
  }

  // 거리 및 경로 추적
  const distances = new Map<string, number>();
  const pathTrace = new Map<string, PathTraceInfo>();
  const visited = new Set<string>();

  // 초기화
  for (const stationId of graph.keys()) {
    distances.set(stationId, Infinity);
  }
  distances.set(startId, 0);
  pathTrace.set(startId, { previousStation: null, line: null, isTransfer: false });

  // 우선순위 큐
  const pq = new PriorityQueue();
  pq.push({
    stationId: startId,
    distance: 0,
    previousStation: null,
    currentLine: stationsMap.get(startId)?.line ?? null,
  });

  while (!pq.isEmpty()) {
    const current = pq.pop()!;

    // 이미 방문한 노드 스킵
    if (visited.has(current.stationId)) continue;
    visited.add(current.stationId);

    // 도착역에 도달
    if (current.stationId === endId) {
      break;
    }

    // 현재 노드의 이웃 탐색
    const node = graph.get(current.stationId);
    if (!node) continue;

    for (const neighbor of node.neighbors) {
      if (visited.has(neighbor.stationId)) continue;

      // 환승 페널티: 환승 시 추가 시간 부과
      let weight = neighbor.weight;
      if (neighbor.isTransfer) {
        weight += 60; // 환승 대기 시간 1분 추가
      }

      const newDistance = current.distance + weight;

      if (newDistance < (distances.get(neighbor.stationId) ?? Infinity)) {
        distances.set(neighbor.stationId, newDistance);
        pathTrace.set(neighbor.stationId, {
          previousStation: current.stationId,
          line: neighbor.line ?? null,
          isTransfer: neighbor.isTransfer,
        });

        pq.push({
          stationId: neighbor.stationId,
          distance: newDistance,
          previousStation: current.stationId,
          currentLine: neighbor.line ?? current.currentLine,
        });
      }
    }
  }

  // 도착역에 도달하지 못한 경우
  if (distances.get(endId) === Infinity) {
    return null;
  }

  // 경로 역추적
  const path: Station[] = [];
  const transferInfos: TransferInfo[] = [];
  let currentId: string | null = endId;
  let prevLine: LineId | null = null;

  while (currentId) {
    const station = stationsMap.get(currentId);
    if (station) {
      path.unshift(station);
    }

    const trace = pathTrace.get(currentId);
    if (!trace) break;

    // 환승 감지
    if (trace.isTransfer && trace.previousStation && prevLine && trace.line) {
      const prevStation = stationsMap.get(trace.previousStation);
      if (prevStation) {
        transferInfos.unshift({
          stationName: prevStation.name,
          fromLine: prevLine,
          toLine: station?.line ?? trace.line,
          walkTime: 180, // 기본 환승 시간
        });
      }
    }

    prevLine = trace.line ?? station?.line ?? null;
    currentId = trace.previousStation;
  }

  // 결과 구성
  const departureStation = stationsMap.get(startId)!;
  const arrivalStation = stationsMap.get(endId)!;

  return {
    departure: departureStation,
    arrival: arrivalStation,
    path,
    totalTime: distances.get(endId) ?? 0,
    transferCount: transferInfos.length,
    transfers: transferInfos,
    stationCount: path.length,
    fare: 0, // 요금은 별도 계산
  };
}

/**
 * 역명으로 최단 경로 탐색
 * 동일 역명의 여러 노선 역 중 최단 경로 반환
 */
export function findShortestPath(
  departureName: string,
  arrivalName: string
): PathResult | null {
  const departureIds = findStationIdsByName(departureName);
  const arrivalIds = findStationIdsByName(arrivalName);

  if (departureIds.length === 0 || arrivalIds.length === 0) {
    return null;
  }

  let bestResult: PathResult | null = null;

  // 모든 출발/도착 조합 중 최단 경로 탐색
  for (const depId of departureIds) {
    for (const arrId of arrivalIds) {
      if (depId === arrId) continue;

      const result = dijkstra(depId, arrId);
      if (result && (!bestResult || result.totalTime < bestResult.totalTime)) {
        bestResult = result;
      }
    }
  }

  return bestResult;
}

export default dijkstra;
