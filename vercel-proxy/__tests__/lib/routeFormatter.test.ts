import { describe, it, expect } from 'vitest';
import { formatRoute } from '../../lib/routeFormatter.js';
import type { RouteApiResponse } from '../../lib/types/index.js';

describe('routeFormatter', () => {
  describe('formatRoute', () => {
    describe('error messages', () => {
      it('should return non-Seoul Metro error for Airport Railroad stations', () => {
        const emptyResponse: RouteApiResponse = { body: { paths: [] } } as any;

        const result = formatRoute(emptyResponse, '인천공항1터미널', '명동', 'ko');
        expect(result).toContain('공항철도');
        expect(result).toContain('서울교통공사 노선만 지원');
      });

      it('should return non-Seoul Metro error in English', () => {
        const emptyResponse: RouteApiResponse = { body: { paths: [] } } as any;

        const result = formatRoute(emptyResponse, '인천공항1터미널', '명동', 'en');
        expect(result).toContain('Airport Railroad');
        expect(result).toContain('Seoul Metro lines only');
      });

      it('should return non-Seoul Metro error for Shinbundang Line stations', () => {
        const emptyResponse: RouteApiResponse = { body: { paths: [] } } as any;

        const result = formatRoute(emptyResponse, '판교', '서울역', 'ko');
        expect(result).toContain('신분당선');
      });

      it('should return Line 2 inner loop error for clockwise direction', () => {
        const emptyResponse: RouteApiResponse = { body: { paths: [] } } as any;

        // 신도림(36) -> 강남(21): inner loop distance is shorter (15 vs 25)
        // This should trigger the inner loop warning
        const result = formatRoute(emptyResponse, '신도림', '역삼', 'ko');
        expect(result).toContain('2호선');
        expect(result).toContain('시계방향');
      });

      it('should return Line 2 inner loop error in English', () => {
        const emptyResponse: RouteApiResponse = { body: { paths: [] } } as any;

        const result = formatRoute(emptyResponse, '신도림', '역삼', 'en');
        expect(result).toContain('Line 2');
        expect(result).toContain('clockwise');
      });

      it('should return generic error for unknown failure', () => {
        const emptyResponse: RouteApiResponse = { body: { paths: [] } } as any;

        // 서울역 -> 종각 are both Seoul Metro, not Line 2 circular issue
        const result = formatRoute(emptyResponse, '서울역', '종각', 'ko');
        expect(result).toContain('경로를 찾을 수 없습니다');
        expect(result).toContain('역명을 확인');
      });

      it('should return generic error in English', () => {
        const emptyResponse: RouteApiResponse = { body: { paths: [] } } as any;

        const result = formatRoute(emptyResponse, '서울역', '종각', 'en');
        expect(result).toContain('Route not found');
        expect(result).toContain('check station names');
      });

      it('should handle missing body', () => {
        const noBodyResponse: RouteApiResponse = {} as any;

        const result = formatRoute(noBodyResponse, '강남', '홍대입구', 'ko');
        expect(result).toContain('경로를 찾을 수 없습니다');
      });

      it('should handle null paths', () => {
        const nullPathsResponse: RouteApiResponse = { body: { paths: null } } as any;

        const result = formatRoute(nullPathsResponse, '강남', '홍대입구', 'ko');
        expect(result).toContain('경로를 찾을 수 없습니다');
      });
    });

    describe('successful formatting', () => {
      const mockRouteResponse: RouteApiResponse = {
        body: {
          totalDstc: 15200,
          totalreqHr: 1920,
          totalCardCrg: 1400,
          paths: [
            {
              dptreStn: { stnNm: '강남', lineNm: '2호선' },
              arvlStn: { stnNm: '홍대입구', lineNm: '2호선' },
              trsitYn: 'N',
              trainDptreTm: '20240615120000',
              trainArvlTm: '20240615123200',
            },
          ],
        },
      } as any;

      it('should format successful route in Korean', () => {
        const result = formatRoute(mockRouteResponse, '강남', '홍대입구', 'ko');

        expect(result).toContain('[강남 → 홍대입구]');
        expect(result).toContain('소요시간');
        expect(result).toContain('요금');
        expect(result).toContain('1,400원');
      });

      it('should format successful route in English', () => {
        const result = formatRoute(mockRouteResponse, '강남', '홍대입구', 'en');

        expect(result).toContain('[Gangnam → Hongdae');
        expect(result).toContain('Time');
        expect(result).toContain('Fare');
      });
    });
  });
});
