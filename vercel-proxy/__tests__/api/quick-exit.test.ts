import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/quick-exit/[station].js';

describe('Quick Exit API Handler', () => {
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

  it('should fetch and return quick exit data for valid station', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', format: 'raw' },
    };

    // Mock data matching actual Seoul Open API response structure
    const mockQuickExitData = {
      getFstExit: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [{
          SBWAY_STTN_NM: '강남',
          SW_NM: '2호선',
          UPBDNB_SE: '상행',
          DRTN_INFO: '역삼',
          QCKGFF_VHCL_DOOR_NO: '3-2',
          PLFM_CMG_FAC: '엘리베이터',
          FAC_NO: '1',
          ELVTR_NO: '02-6110-1234',
          FAC_PSTN_NM: 'B1 승강장',
          FWK_PSTN_NM: '개찰구 앞',
        }],
      },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockQuickExitData), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({
      station: '강남',
      quickExits: expect.any(Array),
    }));
  });

  it('should return formatted markdown by default', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남' },
    };

    const mockData = {
      getFstExit: {
        list_total_count: 0,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [],
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

  it('should filter by facility parameter', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', facility: 'elevator', format: 'raw' },
    };

    const mockData = {
      getFstExit: {
        list_total_count: 0,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [],
      },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
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

  it('should return empty quickExits array on API failure', async () => {
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
      quickExits: [],
    }));
  });

  it('should return English formatted output with lang=en', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', lang: 'en' },
    };

    const mockData = {
      getFstExit: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [{
          SBWAY_STTN_NM: '강남',
          SW_NM: '2호선',
          UPBDNB_SE: '상행',
          DRTN_INFO: '역삼',
          QCKGFF_VHCL_DOOR_NO: '3-2',
          PLFM_CMG_FAC: '엘리베이터',
          FAC_PSTN_NM: 'B1 승강장',
        }],
      },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(sendFn).toHaveBeenCalledWith(expect.stringContaining('Line 2'));
    expect(sendFn).toHaveBeenCalledWith(expect.stringContaining('Yeoksam'));
    expect(sendFn).toHaveBeenCalledWith(expect.stringContaining('Elevator'));
  });

  it('should map new API fields correctly', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', format: 'raw' },
    };

    const mockData = {
      getFstExit: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [{
          SBWAY_STTN_NM: '강남',
          SW_NM: '2호선',
          DRTN_INFO: '역삼',
          QCKGFF_VHCL_DOOR_NO: '3-2',
          PLFM_CMG_FAC: '엘리베이터',
          FAC_PSTN_NM: 'B1 승강장',
        }],
      },
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({
      station: '강남',
      quickExits: expect.arrayContaining([
        expect.objectContaining({
          lineNm: '2호선',
          drtnInfo: '역삼',
          qckgffVhclDoorNo: '3-2',
          plfmCmgFac: '엘리베이터',
          facPstnNm: 'B1 승강장',
        }),
      ]),
    }));
  });
});
