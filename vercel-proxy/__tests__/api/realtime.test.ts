import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRealtimeData } from '../../api/realtime/[station].js';

describe('getRealtimeData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch realtime data with default options', async () => {
    const mockData = {
      realtimeArrivalList: [
        { trainLineNm: '2호선', arvlMsg2: '3분 후 도착' },
      ],
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const result = await getRealtimeData('강남', 'test-api-key');

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('realtimeStationArrival/0/10/%EA%B0%95%EB%82%A8'),
      expect.any(Object)
    );
  });

  it('should fetch realtime data with custom start and end', async () => {
    const mockData = { realtimeArrivalList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getRealtimeData('서울역', 'test-api-key', { start: '5', end: '15' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('realtimeStationArrival/5/15/'),
      expect.any(Object)
    );
  });

  it('should properly encode station name in URL', async () => {
    const mockData = { realtimeArrivalList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getRealtimeData('신도림', 'test-api-key');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('신도림')),
      expect.any(Object)
    );
  });

  it('should include API key in URL', async () => {
    const mockData = { realtimeArrivalList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    await getRealtimeData('강남', 'my-secret-key');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/my-secret-key/'),
      expect.any(Object)
    );
  });

  it('should handle empty realtimeArrivalList', async () => {
    const mockData = { realtimeArrivalList: [] };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const result = await getRealtimeData('없는역', 'test-api-key');

    expect(result.realtimeArrivalList).toEqual([]);
  });

  it('should propagate fetch errors after retries exhausted', async () => {
    vi.useFakeTimers();

    // fetchWithRetry uses retries=2 by default, so we need 3 rejections
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    const promise = getRealtimeData('강남', 'test-api-key');

    // Run all timers and wait for promise resolution
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Network error');
  });
});
