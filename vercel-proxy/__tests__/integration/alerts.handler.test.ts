import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/alerts.js';

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

describe('alerts handler integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env = { ...originalEnv, DATA_GO_KR_KEY: 'test-api-key' };
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

    it('should return 405 for POST request', async () => {
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(405);
      expect(res._data).toMatchObject({
        code: 'METHOD_NOT_ALLOWED',
      });
    });

    it('should return 405 for DELETE request', async () => {
      const req = createMockRequest({ method: 'DELETE' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(405);
    });
  });

  describe('API key validation', () => {
    it('should return 500 when API key is not configured', async () => {
      delete process.env.DATA_GO_KR_KEY;

      const req = createMockRequest({ query: {} });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(500);
      expect(res._data).toMatchObject({
        code: 'API_KEY_NOT_CONFIGURED',
      });
    });
  });

  describe('successful requests', () => {
    it('should return 200 with alerts data using default pagination', async () => {
      const mockData = {
        ntceList: [
          {
            ntceNo: '12345',
            ntceSj: '2호선 운행 지연 안내',
            ntceCn: '신호 장애로 인한 운행 지연',
            lineNm: '2호선',
            regDt: '2024-06-15',
          },
        ],
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({ query: {} });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._data).toEqual(mockData);
      expect(res._headers['Cache-Control']).toBe('s-maxage=300, stale-while-revalidate=600');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('pageNo=1'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('numOfRows=10'),
        expect.any(Object)
      );
    });

    it('should use custom pagination parameters', async () => {
      const mockData = { ntceList: [] };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: { pageNo: '3', numOfRows: '25' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('pageNo=3'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('numOfRows=25'),
        expect.any(Object)
      );
    });

    it('should filter by line name when provided', async () => {
      const mockData = { ntceList: [] };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({
        query: { lineNm: '2호선' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('lineNm=2%ED%98%B8%EC%84%A0'),
        expect.any(Object)
      );
    });

    it('should handle empty alerts list', async () => {
      const mockData = { ntceList: [] };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({ query: {} });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._data).toEqual(mockData);
    });

    it('should handle multiple alerts', async () => {
      const mockData = {
        ntceList: [
          { ntceNo: '1', ntceSj: 'Alert 1', regDt: '2024-06-15' },
          { ntceNo: '2', ntceSj: 'Alert 2', regDt: '2024-06-14' },
          { ntceNo: '3', ntceSj: 'Alert 3', regDt: '2024-06-13' },
        ],
      };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const req = createMockRequest({ query: {} });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect((res._data as { ntceList: unknown[] }).ntceList).toHaveLength(3);
    });
  });

  describe('external API error handling', () => {
    it('should return 500 when external API fails', async () => {
      vi.useFakeTimers();
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockRejectedValueOnce(new Error('Service unavailable'));

      const req = createMockRequest({ query: {} });
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

    it('should return 500 on network timeout', async () => {
      vi.useFakeTimers();
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'));

      const req = createMockRequest({ query: {} });
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
