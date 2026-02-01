import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLastTrainData } from '../../api/last-train/[station].js';

describe('getLastTrainData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch last train data with default options', async () => {
    // First call: get station code
    const stationData = {
      SearchInfoBySubwayNameService: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [{ STATION_CD: '0222', STATION_NM: '강남', LINE_NUM: '02호선', FR_CODE: '222' }],
      },
    };

    // Second call: get last train times
    const lastTrainData = {
      SearchLastTrainTimeOfLine: {
        list_total_count: 2,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [
          {
            STATION_CD: '0222',
            STATION_NM: '강남',
            LINE_NUM: '02호선',
            WEEK_TAG: '1',
            INOUT_TAG: '1',
            FR_CODE: '222',
            LAST_TIME: '003200',
            LAST_STATION: '성수',
          },
          {
            STATION_CD: '0222',
            STATION_NM: '강남',
            LINE_NUM: '02호선',
            WEEK_TAG: '1',
            INOUT_TAG: '2',
            FR_CODE: '222',
            LAST_TIME: '002500',
            LAST_STATION: '신도림',
          },
        ],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(stationData), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(lastTrainData), { status: 200 }));

    const result = await getLastTrainData('강남', 'test-api-key');

    expect(result.station).toBe('강남');
    expect(result.stationEn).toBe('Gangnam');
    expect(result.lastTrains).toHaveLength(2);
    expect(result.lastTrains[0]?.time).toBe('00:32');
    expect(result.lastTrains[0]?.destination).toBe('성수');
  });

  it('should format time correctly', async () => {
    const stationData = {
      SearchInfoBySubwayNameService: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [{ STATION_CD: '0222', STATION_NM: '강남', LINE_NUM: '02호선', FR_CODE: '222' }],
      },
    };

    const lastTrainData = {
      SearchLastTrainTimeOfLine: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [
          {
            STATION_CD: '0222',
            STATION_NM: '강남',
            LINE_NUM: '02호선',
            WEEK_TAG: '1',
            INOUT_TAG: '1',
            FR_CODE: '222',
            LAST_TIME: '235959',
            LAST_STATION: '성수',
          },
        ],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(stationData), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(lastTrainData), { status: 200 }));

    const result = await getLastTrainData('강남', 'test-api-key');

    expect(result.lastTrains[0]?.time).toBe('23:59');
  });

  it('should handle direction filter (up)', async () => {
    const stationData = {
      SearchInfoBySubwayNameService: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [{ STATION_CD: '0222', STATION_NM: '강남', LINE_NUM: '02호선', FR_CODE: '222' }],
      },
    };

    const lastTrainData = {
      SearchLastTrainTimeOfLine: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(stationData), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(lastTrainData), { status: 200 }));

    await getLastTrainData('강남', 'test-api-key', { direction: 'up' });

    // Check that the second fetch call has direction=1 (up)
    expect(fetch).toHaveBeenCalledTimes(2);
    const secondCall = vi.mocked(fetch).mock.calls[1]?.[0] as string;
    expect(secondCall).toContain('/1/10/0222/');
    expect(secondCall).toMatch(/\/0222\/\d+\/1$/);
  });

  it('should handle direction filter (down)', async () => {
    const stationData = {
      SearchInfoBySubwayNameService: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [{ STATION_CD: '0222', STATION_NM: '강남', LINE_NUM: '02호선', FR_CODE: '222' }],
      },
    };

    const lastTrainData = {
      SearchLastTrainTimeOfLine: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(stationData), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(lastTrainData), { status: 200 }));

    await getLastTrainData('강남', 'test-api-key', { direction: 'down' });

    // Check that the second fetch call has direction=2 (down)
    expect(fetch).toHaveBeenCalledTimes(2);
    const secondCall = vi.mocked(fetch).mock.calls[1]?.[0] as string;
    expect(secondCall).toMatch(/\/0222\/\d+\/2$/);
  });

  it('should throw error when station code not found', async () => {
    const stationData = {
      SearchInfoBySubwayNameService: {
        list_total_count: 0,
        RESULT: { CODE: 'INFO-200', MESSAGE: 'No data' },
        row: [],
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(stationData), { status: 200 })
    );

    await expect(getLastTrainData('없는역', 'test-api-key')).rejects.toThrow('Station code not found');
  });

  it('should handle empty last train list', async () => {
    const stationData = {
      SearchInfoBySubwayNameService: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [{ STATION_CD: '0222', STATION_NM: '강남', LINE_NUM: '02호선', FR_CODE: '222' }],
      },
    };

    const lastTrainData = {
      SearchLastTrainTimeOfLine: {
        list_total_count: 0,
        RESULT: { CODE: 'INFO-200', MESSAGE: 'No data' },
        row: [],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(stationData), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(lastTrainData), { status: 200 }));

    const result = await getLastTrainData('강남', 'test-api-key');

    expect(result.lastTrains).toEqual([]);
  });

  it('should handle weekType parameter', async () => {
    const stationData = {
      SearchInfoBySubwayNameService: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: 'Success' },
        row: [{ STATION_CD: '0222', STATION_NM: '강남', LINE_NUM: '02호선', FR_CODE: '222' }],
      },
    };

    const lastTrainData = {
      SearchLastTrainTimeOfLine: {
        list_total_count: 0,
        RESULT: { CODE: 'INFO-200', MESSAGE: 'No data' },
        row: [],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(stationData), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(lastTrainData), { status: 200 }));

    await getLastTrainData('강남', 'test-api-key', { weekType: '3' }); // Sunday

    // Check that the second fetch call has weekType=3
    const secondCall = vi.mocked(fetch).mock.calls[1]?.[0] as string;
    expect(secondCall).toContain('/0222/3/');
  });
});
