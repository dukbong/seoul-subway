import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStationsData } from '../../api/stations.js';

describe('getStationsData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch station data with default options', async () => {
    const mockData = {
      SearchInfoBySubwayNameService: {
        row: [{ STATION_NM: '강남', LINE_NUM: '02호선' }],
      },
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const result = await getStationsData('강남', 'test-api-key');

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('SearchInfoBySubwayNameService/1/10/'),
      expect.any(Object)
    );
  });

  it('should fetch station data with custom start and end', async () => {
    const mockData = { SearchInfoBySubwayNameService: { row: [] } };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getStationsData('서울역', 'test-api-key', { start: '5', end: '15' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('SearchInfoBySubwayNameService/5/15/'),
      expect.any(Object)
    );
  });

  it('should properly encode station name in URL', async () => {
    const mockData = { SearchInfoBySubwayNameService: { row: [] } };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getStationsData('신도림', 'test-api-key');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('신도림')),
      expect.any(Object)
    );
  });

  it('should include API key in URL', async () => {
    const mockData = { SearchInfoBySubwayNameService: { row: [] } };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getStationsData('강남', 'my-secret-key');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/my-secret-key/'),
      expect.any(Object)
    );
  });

  it('should use correct API URL', async () => {
    const mockData = { SearchInfoBySubwayNameService: { row: [] } };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getStationsData('강남', 'test-api-key');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://openapi.seoul.go.kr:8088/'),
      expect.any(Object)
    );
  });

  it('should handle empty result', async () => {
    const mockData = { SearchInfoBySubwayNameService: { row: [] } };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const result = await getStationsData('없는역', 'test-api-key');

    expect(result.SearchInfoBySubwayNameService!.row).toEqual([]);
  });

  it('should propagate fetch errors after retries exhausted', async () => {
    vi.useFakeTimers();

    // fetchWithRetry uses retries=2 by default, so we need 3 rejections
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockRejectedValueOnce(new Error('Connection refused'));

    const promise = getStationsData('강남', 'test-api-key');

    // Run all timers and wait for promise resolution
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Connection refused');
  });

  it('should handle multiple station matches', async () => {
    const mockData = {
      SearchInfoBySubwayNameService: {
        row: [
          { STATION_NM: '강남', LINE_NUM: '02호선' },
          { STATION_NM: '강남', LINE_NUM: '신분당선' },
        ],
      },
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const result = await getStationsData('강남', 'test-api-key');

    expect(result.SearchInfoBySubwayNameService!.row).toHaveLength(2);
  });
});
