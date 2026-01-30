import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAlertsData } from '../../api/alerts.js';

describe('getAlertsData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch alerts with default pagination', async () => {
    const mockData = {
      ntceList: [
        { ntceNo: '1', ntceCn: 'Test alert' },
      ],
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const result = await getAlertsData('test-api-key');

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('pageNo=1'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('numOfRows=10'),
      expect.any(Object)
    );
  });

  it('should fetch alerts with custom pagination', async () => {
    const mockData = { ntceList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getAlertsData('test-api-key', { pageNo: '2', numOfRows: '20' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('pageNo=2'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('numOfRows=20'),
      expect.any(Object)
    );
  });

  it('should filter by line name when provided', async () => {
    const mockData = { ntceList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getAlertsData('test-api-key', { lineNm: '2호선' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('lineNm=2%ED%98%B8%EC%84%A0'),
      expect.any(Object)
    );
  });

  it('should not include lineNm when not provided', async () => {
    const mockData = { ntceList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getAlertsData('test-api-key', {});

    expect(fetch).toHaveBeenCalledWith(
      expect.not.stringContaining('lineNm'),
      expect.any(Object)
    );
  });

  it('should use correct API URL', async () => {
    const mockData = { ntceList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getAlertsData('test-api-key');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B553766/ntce/getNtceList'),
      expect.any(Object)
    );
  });

  it('should include service key and data type', async () => {
    const mockData = { ntceList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getAlertsData('my-service-key');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('serviceKey=my-service-key'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('dataType=JSON'),
      expect.any(Object)
    );
  });

  it('should propagate fetch errors after retries exhausted', async () => {
    vi.useFakeTimers();

    // fetchWithRetry uses retries=2 by default, so we need 3 rejections
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Server unavailable'))
      .mockRejectedValueOnce(new Error('Server unavailable'))
      .mockRejectedValueOnce(new Error('Server unavailable'));

    const promise = getAlertsData('test-api-key');

    // Run all timers and wait for promise resolution
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Server unavailable');
  });

  it('should handle empty ntceList', async () => {
    const mockData = { ntceList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const result = await getAlertsData('test-api-key');

    expect(result.ntceList).toEqual([]);
  });
});
