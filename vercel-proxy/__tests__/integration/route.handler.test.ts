import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/route.js';

function createMockRequest(options: {
  method?: string;
  query?: Record<string, string | string[]>;
}): VercelRequest {
  return {
    method: options.method || 'GET',
    query: options.query || {},
  } as VercelRequest;
}

function createMockResponse(): VercelResponse & {
  _status: number;
  _data: unknown;
  _headers: Record<string, string>;
} {
  const res = {
    _status: 200,
    _data: null as unknown,
    _headers: {} as Record<string, string>,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(data: unknown) {
      this._data = data;
      return this;
    },
    send(data: unknown) {
      this._data = data;
      return this;
    },
    end() {
      return this;
    },
    setHeader(name: string, value: string) {
      this._headers[name] = value;
      return this;
    },
  };
  return res as VercelResponse & typeof res;
}

describe('route handler integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T03:00:00.000Z'));
    vi.stubGlobal('fetch', vi.fn());
    process.env = { ...originalEnv, DATA_GO_KR_KEY: 'test-api-key' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    process.env = originalEnv;
  });

  describe('HTTP method handling', () => {
    it('should return 200 for OPTIONS request', async () => {
      const req = createMockRequest({ method: 'OPTIONS' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
    });

    it('should return 405 for non-GET methods', async () => {
      const req = createMockRequest({
        method: 'POST',
        query: { dptreStnNm: '강남', arvlStnNm: '홍대입구' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(405);
      expect(res._data).toMatchObject({
        code: 'METHOD_NOT_ALLOWED',
      });
    });
  });

  describe('parameter validation', () => {
    it('should return 400 when dptreStnNm is missing', async () => {
      const req = createMockRequest({ query: { arvlStnNm: '홍대입구' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(400);
      expect(res._data).toMatchObject({
        code: 'MISSING_PARAMETER',
        details: expect.objectContaining({
          required: ['dptreStnNm', 'arvlStnNm'],
        }),
      });
    });

    it('should return 400 when arvlStnNm is missing', async () => {
      const req = createMockRequest({ query: { dptreStnNm: '강남' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(400);
      expect(res._data).toMatchObject({
        code: 'MISSING_PARAMETER',
      });
    });

    it('should return 400 when both parameters are missing', async () => {
      const req = createMockRequest({ query: {} });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(400);
    });

    it('should return 400 for invalid departure station with suggestions', async () => {
      // 'gngm' has Levenshtein distance > 1 from 'gangnam', so fuzzy matching fails
      const req = createMockRequest({
        query: { dptreStnNm: 'gngm', arvlStnNm: '홍대입구' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(400);
      expect(res._data).toMatchObject({
        code: 'INVALID_STATION_NAME',
        details: expect.objectContaining({
          param: 'dptreStnNm',
        }),
      });
    });

    it('should return 400 for invalid arrival station with suggestions', async () => {
      // 'hngde' has Levenshtein distance > 1 from 'hongdae', so fuzzy matching fails
      const req = createMockRequest({
        query: { dptreStnNm: '강남', arvlStnNm: 'hngde' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(400);
      expect(res._data).toMatchObject({
        code: 'INVALID_STATION_NAME',
        details: expect.objectContaining({
          param: 'arvlStnNm',
        }),
      });
    });
  });

  describe('API key validation', () => {
    it('should return 500 when API key is not configured', async () => {
      delete process.env.DATA_GO_KR_KEY;

      const req = createMockRequest({
        query: { dptreStnNm: '강남', arvlStnNm: '홍대입구' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(500);
      expect(res._data).toMatchObject({
        code: 'API_KEY_NOT_CONFIGURED',
      });
    });
  });

  describe('successful requests', () => {
    it('should return 200 with route data', async () => {
      const mockData = {
        result: {
          globalTravelTime: 25,
          globalStationCount: 10,
          fare: 1350,
          path: [
            { idx: 1, stnNm: '강남', lnCd: '02', lnNm: '2호선' },
            { idx: 2, stnNm: '홍대입구', lnCd: '02', lnNm: '2호선' },
          ],
        },
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: { dptreStnNm: '강남', arvlStnNm: '홍대입구', format: 'raw' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._data).toEqual(mockData);
      expect(res._headers['Cache-Control']).toBe('s-maxage=300, stale-while-revalidate=600');
    });

    it('should return formatted markdown by default', async () => {
      const mockData = {
        header: { resultCode: '00', resultMsg: '성공' },
        body: {
          totalDstc: 22100,
          totalreqHr: 1500,
          totalCardCrg: 1350,
          paths: [
            {
              dptreStn: { stnCd: '0222', stnNo: '222', stnNm: '강남', lineNm: '2호선' },
              arvlStn: { stnCd: '0239', stnNo: '239', stnNm: '홍대입구', lineNm: '2호선' },
              trsitYn: 'N',
            },
          ],
        },
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: { dptreStnNm: '강남', arvlStnNm: '홍대입구' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(typeof res._data).toBe('string');
      expect(res._data).toContain('강남');
      expect(res._data).toContain('홍대입구');
      expect(res._headers['Content-Type']).toBe('text/plain; charset=utf-8');
    });

    it('should normalize English station names', async () => {
      const mockData = {
        result: {
          globalTravelTime: 25,
          globalStationCount: 10,
          fare: 1350,
          path: [
            { idx: 1, stnNm: '강남', lnCd: '02', lnNm: '2호선' },
            { idx: 2, stnNm: '홍대입구', lnCd: '02', lnNm: '2호선' },
          ],
        },
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: { dptreStnNm: 'Gangnam', arvlStnNm: 'Hongdae', format: 'raw' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('강남')),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('홍대입구')),
        expect.any(Object)
      );
    });

    it('should use custom searchDt when provided', async () => {
      const mockData = {
        result: {
          globalTravelTime: 25,
          globalStationCount: 10,
          fare: 1350,
          path: [
            { idx: 1, stnNm: '강남', lnCd: '02', lnNm: '2호선' },
            { idx: 2, stnNm: '홍대입구', lnCd: '02', lnNm: '2호선' },
          ],
        },
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: {
          dptreStnNm: '강남',
          arvlStnNm: '홍대입구',
          searchDt: '2024-07-01 15:30:00',
          format: 'raw',
        },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('searchDt=2024-07-01+15%3A30%3A00'),
        expect.any(Object)
      );
    });

    it('should include searchType when provided', async () => {
      const mockData = {
        result: {
          globalTravelTime: 25,
          globalStationCount: 10,
          fare: 1350,
          path: [
            { idx: 1, stnNm: '강남', lnCd: '02', lnNm: '2호선' },
            { idx: 2, stnNm: '홍대입구', lnCd: '02', lnNm: '2호선' },
          ],
        },
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: {
          dptreStnNm: '강남',
          arvlStnNm: '홍대입구',
          searchType: 'FASTEST',
          format: 'raw',
        },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('searchType=FASTEST'),
        expect.any(Object)
      );
    });
  });

  describe('external API error handling', () => {
    it('should fallback to internal routing when external API fails for Seoul Metro stations', async () => {
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('API timeout'))
        .mockRejectedValueOnce(new Error('API timeout'));

      const req = createMockRequest({
        query: { dptreStnNm: '강남', arvlStnNm: '홍대입구' },
      });
      const res = createMockResponse();

      const promise = handler(req, res);
      await vi.runAllTimersAsync();
      await promise;

      // Should succeed with internal routing fallback
      expect(res._status).toBe(200);
      expect(res._headers['Content-Type']).toBe('text/plain; charset=utf-8');
    });
  });
});
