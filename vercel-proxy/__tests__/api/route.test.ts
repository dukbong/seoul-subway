import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRouteData, getKSTDateTime } from '../../api/route.js';

describe('getKSTDateTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return date in YYYY-MM-DD HH:mm:ss format', () => {
    const result = getKSTDateTime();

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('should return KST time (UTC+9)', () => {
    vi.useFakeTimers();
    const mockDate = new Date('2024-01-15T00:00:00.000Z');
    vi.setSystemTime(mockDate);

    const result = getKSTDateTime();

    // UTC 00:00 + 9 hours = KST 09:00
    expect(result).toBe('2024-01-15 09:00:00');
  });
});

describe('getRouteData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T03:00:00.000Z')); // KST 12:00
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch route data with required parameters', async () => {
    const mockData = {
      result: {
        path: [{ stnNm: '신도림' }, { stnNm: '서울역' }],
      },
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const result = await getRouteData('test-api-key', {
      dptreStnNm: '신도림',
      arvlStnNm: '서울역',
    });

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('dptreStnNm=%EC%8B%A0%EB%8F%84%EB%A6%BC'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('arvlStnNm=%EC%84%9C%EC%9A%B8%EC%97%AD'),
      expect.any(Object)
    );
  });

  it('should use current KST time when searchDt not provided', async () => {
    const mockData = { result: {} };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getRouteData('test-api-key', {
      dptreStnNm: '강남',
      arvlStnNm: '홍대입구',
    });

    // KST is UTC+9, so 2024-06-15 03:00 UTC = 2024-06-15 12:00 KST
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('searchDt=2024-06-15+12%3A00%3A00'),
      expect.any(Object)
    );
  });

  it('should use provided searchDt when specified', async () => {
    const mockData = { result: {} };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getRouteData('test-api-key', {
      dptreStnNm: '강남',
      arvlStnNm: '홍대입구',
      searchDt: '2024-07-01 15:30:00',
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('searchDt=2024-07-01+15%3A30%3A00'),
      expect.any(Object)
    );
  });

  it('should include searchType when provided', async () => {
    const mockData = { result: {} };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getRouteData('test-api-key', {
      dptreStnNm: '강남',
      arvlStnNm: '홍대입구',
      searchType: 'FASTEST',
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('searchType=FASTEST'),
      expect.any(Object)
    );
  });

  it('should not include searchType when not provided', async () => {
    const mockData = { result: {} };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getRouteData('test-api-key', {
      dptreStnNm: '강남',
      arvlStnNm: '홍대입구',
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.not.stringContaining('searchType'),
      expect.any(Object)
    );
  });

  it('should propagate fetch errors after retries exhausted', async () => {
    // fetchWithRetry uses retries=2 by default, so we need 3 rejections
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('API timeout'))
      .mockRejectedValueOnce(new Error('API timeout'))
      .mockRejectedValueOnce(new Error('API timeout'));

    const promise = getRouteData('test-api-key', {
      dptreStnNm: '강남',
      arvlStnNm: '홍대입구',
    });

    // Run all timers and wait for promise resolution
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('API timeout');
  });
});
