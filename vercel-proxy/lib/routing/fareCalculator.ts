/**
 * 지하철 요금 계산기
 * 거리 비례제 기반 요금 산정
 */
import type { PathResult, LineId } from '../types/graph';

/** 기본 요금 (10km 이내) */
const BASE_FARE = 1400;

/** 10km 초과 ~ 50km 이내: 5km당 100원 */
const FARE_PER_5KM_UNDER_50 = 100;

/** 50km 초과: 8km당 100원 */
const FARE_PER_8KM_OVER_50 = 100;

/** 신분당선 추가 요금 (기본) */
const SHINBUNDANG_EXTRA_FARE = 500;

/** 공항철도 추가 요금 (일반열차) */
const AREX_EXTRA_FARE = 500;

/** 역당 평균 거리 (km) */
const AVG_DISTANCE_PER_STATION = 1.5;

/**
 * 경로 기반 요금 계산
 * @param result 경로 탐색 결과
 * @returns 예상 요금 (원)
 */
export function calculateFare(result: PathResult): number {
  // 역 수 기반 예상 거리 계산
  const stationCount = result.stationCount - 1; // 시작역 제외
  const estimatedDistance = stationCount * AVG_DISTANCE_PER_STATION;

  let fare = BASE_FARE;

  // 거리 비례 추가 요금
  if (estimatedDistance > 10) {
    if (estimatedDistance <= 50) {
      // 10km 초과 ~ 50km: 5km당 100원
      const extraKm = estimatedDistance - 10;
      fare += Math.ceil(extraKm / 5) * FARE_PER_5KM_UNDER_50;
    } else {
      // 50km 초과: 10~50km 구간 + 50km 초과 구간
      fare += Math.ceil(40 / 5) * FARE_PER_5KM_UNDER_50; // 10~50km 구간
      const extraKm = estimatedDistance - 50;
      fare += Math.ceil(extraKm / 8) * FARE_PER_8KM_OVER_50;
    }
  }

  // 타사 노선 추가 요금
  const usedLines = getUsedLines(result);

  if (usedLines.has('SBD')) {
    fare += SHINBUNDANG_EXTRA_FARE;
  }

  if (usedLines.has('AREX')) {
    fare += AREX_EXTRA_FARE;
  }

  return fare;
}

/**
 * 경로에서 사용된 노선 목록 추출
 */
function getUsedLines(result: PathResult): Set<LineId> {
  const lines = new Set<LineId>();

  for (const station of result.path) {
    lines.add(station.line);
  }

  return lines;
}

/**
 * 요금을 문자열로 포맷팅
 */
export function formatFare(fare: number): string {
  return `${fare.toLocaleString('ko-KR')}원`;
}

/**
 * 요금을 영어로 포맷팅
 */
export function formatFareEn(fare: number): string {
  return `₩${fare.toLocaleString('en-US')}`;
}

export default calculateFare;
