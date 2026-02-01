import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/restrooms/[station].js';

describe('Restrooms API Handler', () => {
  let mockReq: Partial<VercelRequest>;
  let mockRes: Partial<VercelResponse>;
  let statusFn: ReturnType<typeof vi.fn>;
  let jsonFn: ReturnType<typeof vi.fn>;
  let sendFn: ReturnType<typeof vi.fn>;
  let setHeaderFn: ReturnType<typeof vi.fn>;
  let endFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('SEOUL_OPENAPI_KEY', 'test-api-key');

    statusFn = vi.fn().mockReturnThis();
    jsonFn = vi.fn().mockReturnThis();
    sendFn = vi.fn().mockReturnThis();
    setHeaderFn = vi.fn().mockReturnThis();
    endFn = vi.fn().mockReturnThis();

    mockRes = {
      status: statusFn,
      json: jsonFn,
      send: sendFn,
      setHeader: setHeaderFn,
      end: endFn,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('should return 200 for OPTIONS request', async () => {
    mockReq = {
      method: 'OPTIONS',
      query: {},
    };

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(endFn).toHaveBeenCalled();
  });

  it('should return 405 for non-GET requests', async () => {
    mockReq = {
      method: 'POST',
      query: {},
    };

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(405);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ code: 'METHOD_NOT_ALLOWED' }));
  });

  it('should return 400 for missing station parameter', async () => {
    mockReq = {
      method: 'GET',
      query: {},
    };

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ code: 'MISSING_PARAMETER' }));
  });

  it('should return 400 for invalid station', async () => {
    mockReq = {
      method: 'GET',
      query: { station: 'invalidstation' },
    };

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_STATION_NAME' }));
  });

  it('should return 500 if API key is not configured', async () => {
    vi.unstubAllEnvs();
    mockReq = {
      method: 'GET',
      query: { station: '강남' },
    };

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(500);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ code: 'API_KEY_NOT_CONFIGURED' }));
  });

  it('should fetch and return restroom data for valid station', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', format: 'raw' },
    };

    const mockRestroomData = {
      getFcRstrm: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [{
          stnNm: '강남',
          lineNm: '2호선',
          dtlPstn: '대합실',
          flr: 'B1',
          grndUdgdSe: '지하',
          gateInotrSe: '1',
          mlsexToiletInnb: 3,
          mlsexUrinInnb: 5,
          wmsexToiletInnb: 5,
          dspsnToiletInnb: 1,
          babyChngSttus: 'Y',
          rstrmInfo: '일반(남,여) / 교통약자(남,여)',
          whlchrAcsPsbltyYn: 'Y',
        }],
      },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockRestroomData), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({
      station: '강남',
      restrooms: expect.any(Array),
    }));
  });

  it('should return formatted markdown by default', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남' },
    };

    const mockData = {
      getFcRstrm: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [{
          stnNm: '강남',
          lineNm: '2호선',
          dtlPstn: '대합실',
          flr: 'B1',
          grndUdgdSe: '지하',
          gateInotrSe: '1',
          rstrmInfo: '일반(남,여)',
        }],
      },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(setHeaderFn).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8');
    expect(sendFn).toHaveBeenCalled();
  });

  it('should set long cache headers', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', format: 'raw' },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(setHeaderFn).toHaveBeenCalledWith('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  });

  it('should support English station names', async () => {
    mockReq = {
      method: 'GET',
      query: { station: 'Gangnam', format: 'raw' },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
  });

  it('should return empty restrooms array on API failure', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', format: 'raw' },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response('', { status: 500 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({
      restrooms: [],
    }));
  });

  it('should support lang parameter for English output', async () => {
    mockReq = {
      method: 'GET',
      query: { station: 'Gangnam', lang: 'en' },
    };

    const mockData = {
      getFcRstrm: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [{
          stnNm: '강남',
          lineNm: '2호선',
          dtlPstn: '대합실',
          flr: 'B1',
          grndUdgdSe: '지하',
          gateInotrSe: '1',
          rstrmInfo: '일반(남,여)',
        }],
      },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(sendFn).toHaveBeenCalled();
    // Should contain English text
    const sentContent = sendFn.mock.calls[0]?.[0] as string | undefined;
    expect(sentContent).toBeDefined();
    expect(sentContent).toContain('Gangnam');
  });

  it('should display accessible restroom info from rstrmInfo field', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남' },
    };

    const mockData = {
      getFcRstrm: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [{
          stnNm: '강남',
          lineNm: '2호선',
          dtlPstn: '대합실',
          flr: 'B1',
          grndUdgdSe: '지하',
          gateInotrSe: '1',
          rstrmInfo: '일반(남,여) / 교통약자(남,여)',
          whlchrAcsPsbltyYn: 'Y',
          babyChngSttus: 'Y',
        }],
      },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    const sentContent = sendFn.mock.calls[0]?.[0] as string | undefined;
    expect(sentContent).toBeDefined();
    // Should contain accessible restroom type
    expect(sentContent).toContain('교통약자');
    // Should contain wheelchair access
    expect(sentContent).toContain('♿');
    // Should show accessible count in summary
    expect(sentContent).toContain('장애인화장실 1개');
    expect(sentContent).toContain('휠체어접근 1개');
  });
});
