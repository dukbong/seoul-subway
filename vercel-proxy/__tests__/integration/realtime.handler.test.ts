import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/realtime/[station].js';

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

describe('realtime handler integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env = { ...originalEnv, SEOUL_OPENAPI_KEY: 'test-api-key' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      const req = createMockRequest({ method: 'POST', query: { station: '강남' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(405);
      expect(res._data).toMatchObject({
        code: 'METHOD_NOT_ALLOWED',
      });
    });
  });

  describe('parameter validation', () => {
    it('should return 400 when station parameter is missing', async () => {
      const req = createMockRequest({ query: {} });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(400);
      expect(res._data).toMatchObject({
        code: 'MISSING_PARAMETER',
      });
    });

    it('should return 400 for invalid station with suggestions', async () => {
      // 'gngm' has Levenshtein distance > 1 from 'gangnam', so fuzzy matching fails
      const req = createMockRequest({ query: { station: 'gngm' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(400);
      expect(res._data).toMatchObject({
        code: 'INVALID_STATION_NAME',
        details: expect.objectContaining({
          input: 'gngm',
        }),
      });
    });
  });

  describe('API key validation', () => {
    it('should return 500 when API key is not configured', async () => {
      delete process.env.SEOUL_OPENAPI_KEY;

      const req = createMockRequest({ query: { station: '강남' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(500);
      expect(res._data).toMatchObject({
        code: 'API_KEY_NOT_CONFIGURED',
      });
    });
  });

  describe('successful requests', () => {
    it('should return 200 with realtime arrival data', async () => {
      const mockData = {
        realtimeArrivalList: [
          {
            rowNum: 1,
            subwayId: '1002',
            updnLine: '상행',
            trainLineNm: '강남방면',
            statnNm: '강남',
            btrainNo: '2034',
            bstatnNm: '성수',
            arvlMsg2: '3분 후 도착',
            arvlMsg3: '역삼',
            arvlCd: '1',
          },
        ],
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({ query: { station: '강남' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._data).toEqual(mockData);
      expect(res._headers['Cache-Control']).toBe('s-maxage=30, stale-while-revalidate=60');
    });

    it('should handle English station names (case-insensitive)', async () => {
      const mockData = { realtimeArrivalList: [] };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({ query: { station: 'SEOUL STATION' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('서울역')),
        expect.any(Object)
      );
    });

    it('should pass custom start and end parameters', async () => {
      const mockData = { realtimeArrivalList: [] };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: { station: '강남', start: '0', end: '5' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/0/5/'),
        expect.any(Object)
      );
    });
  });

  describe('external API error handling', () => {
    it('should return 500 when external API fails', async () => {
      vi.useFakeTimers();
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      const req = createMockRequest({ query: { station: '강남' } });
      const res = createMockResponse();

      const promise = handler(req, res);
      await vi.runAllTimersAsync();
      await promise;

      expect(res._status).toBe(500);
      expect(res._data).toMatchObject({
        code: 'EXTERNAL_API_FAILURE',
      });

      vi.useRealTimers();
    });

    it('should handle API error response', async () => {
      const mockErrorData = {
        errorMessage: {
          status: 500,
          code: 'ERROR-300',
          message: '서비스 점검 중',
        },
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockErrorData), { status: 200 })
      );

      const req = createMockRequest({ query: { station: '강남' } });
      const res = createMockResponse();

      await handler(req, res);

      // API returns 200 but with error in body - handler passes through
      expect(res._status).toBe(200);
      expect(res._data).toEqual(mockErrorData);
    });
  });
});
