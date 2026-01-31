import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/stations.js';

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

describe('stations handler integration', () => {
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
    it('should return 200 for OPTIONS request (CORS preflight)', async () => {
      const req = createMockRequest({ method: 'OPTIONS' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
    });

    it('should return 405 for POST request', async () => {
      const req = createMockRequest({ method: 'POST', query: { station: '강남' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(405);
      expect(res._data).toMatchObject({
        code: 'METHOD_NOT_ALLOWED',
      });
    });

    it('should return 405 for PUT request', async () => {
      const req = createMockRequest({ method: 'PUT', query: { station: '강남' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(405);
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
        details: { required: ['station'] },
      });
    });

    it('should return 400 for invalid station name with suggestions', async () => {
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

    it('should return 400 for completely unknown station', async () => {
      const req = createMockRequest({ query: { station: 'xyz123' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(400);
      expect(res._data).toMatchObject({
        code: 'INVALID_STATION_NAME',
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
    it('should return 200 with data for valid Korean station name', async () => {
      const mockData = {
        SearchInfoBySubwayNameService: {
          list_total_count: 1,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리' },
          row: [{ STATION_NM: '강남', LINE_NUM: '02호선' }],
        },
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({ query: { station: '강남' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._data).toEqual(mockData);
      expect(res._headers['Cache-Control']).toBe('s-maxage=3600, stale-while-revalidate=7200');
    });

    it('should normalize English station name to Korean', async () => {
      const mockData = {
        SearchInfoBySubwayNameService: {
          row: [{ STATION_NM: '강남', LINE_NUM: '02호선' }],
        },
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({ query: { station: 'Gangnam' } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('강남')),
        expect.any(Object)
      );
    });

    it('should pass custom start and end parameters', async () => {
      const mockData = { SearchInfoBySubwayNameService: { row: [] } };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: { station: '강남', start: '5', end: '20' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/5/20/'),
        expect.any(Object)
      );
    });
  });

  describe('external API error handling', () => {
    it('should return 500 when external API fails', async () => {
      vi.useFakeTimers();
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockRejectedValueOnce(new Error('Connection refused'));

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
  });
});
