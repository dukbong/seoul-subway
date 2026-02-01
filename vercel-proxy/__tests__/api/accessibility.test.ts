import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/accessibility/[station].js';

describe('Accessibility API Handler', () => {
  let mockReq: Partial<VercelRequest>;
  let mockRes: Partial<VercelResponse>;
  let statusFn: ReturnType<typeof vi.fn>;
  let jsonFn: ReturnType<typeof vi.fn>;
  let sendFn: ReturnType<typeof vi.fn>;
  let setHeaderFn: ReturnType<typeof vi.fn>;
  let endFn: ReturnType<typeof vi.fn>;

  const createMockResponse = (data: object) => {
    return new Response(JSON.stringify(data), { status: 200 });
  };

  const mockEmptyApiData = {
    getFcElvtr: { list_total_count: 0, RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' }, row: [] },
    getFcEsctr: { list_total_count: 0, RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' }, row: [] },
    getWksnElvtr: { list_total_count: 0, RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' }, row: [] },
    getWksnEsctr: { list_total_count: 0, RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' }, row: [] },
    getWksnWhcllift: { list_total_count: 0, RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' }, row: [] },
  };

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

  it('should fetch and return accessibility data for valid station', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', format: 'raw' },
    };

    const mockElevatorData = {
      getFcElvtr: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'OK' },
        row: [{ SBWAY_STTN_NM: '강남', INSTL_PLACE: '1층', SW_NM: '2호선', GROUND_CD: '2', INSTL_LT: 'B1', ELVTR_SE: '일반' }],
      },
    };

    // Each fetch call needs a fresh Response
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse(mockElevatorData))
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({
      station: '강남',
      elevators: expect.objectContaining({
        locations: expect.any(Array),
      }),
    }));
  });

  it('should return formatted markdown by default', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남' },
    };

    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse(mockEmptyApiData))
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(setHeaderFn).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8');
    expect(sendFn).toHaveBeenCalled();
  });

  it('should filter by type parameter', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', type: 'elevator', format: 'raw' },
    };

    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse(mockEmptyApiData))
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalled();
  });

  it('should set long cache headers for facility info', async () => {
    mockReq = {
      method: 'GET',
      query: { station: '강남', format: 'raw' },
    };

    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse(mockEmptyApiData))
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(setHeaderFn).toHaveBeenCalledWith('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  });

  it('should support English station names', async () => {
    mockReq = {
      method: 'GET',
      query: { station: 'Gangnam', format: 'raw' },
    };

    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse(mockEmptyApiData))
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(statusFn).toHaveBeenCalledWith(200);
  });
});
