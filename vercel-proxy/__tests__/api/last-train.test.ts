import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLastTrainData } from '../../api/last-train/[station].js';

describe('getLastTrainData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch last train data with default options', () => {
    // Set to weekday
    vi.setSystemTime(new Date('2025-01-20T12:00:00+09:00')); // Monday

    const result = getLastTrainData('강남');

    expect(result.station).toBe('강남');
    expect(result.stationEn).toBe('Gangnam');
    expect(result.lastTrains.length).toBeGreaterThan(0);
    expect(result.lastTrains[0]?.weekType).toBe('평일');
  });

  it('should return correct last train times for Gangnam', () => {
    vi.setSystemTime(new Date('2025-01-20T12:00:00+09:00')); // Monday

    const result = getLastTrainData('강남', { weekType: '1' });

    expect(result.station).toBe('강남');
    expect(result.stationEn).toBe('Gangnam');
    expect(result.lastTrains.length).toBeGreaterThanOrEqual(2);

    // Check that we have Line 2 data
    const line2Trains = result.lastTrains.filter(t => t.line === '2호선');
    expect(line2Trains.length).toBeGreaterThanOrEqual(2);

    // Check inner circle (내선순환)
    const innerCircle = line2Trains.find(t => t.destination === '성수');
    expect(innerCircle).toBeDefined();
    expect(innerCircle?.time).toBe('00:32');
  });

  it('should handle direction filter (up)', () => {
    const result = getLastTrainData('강남', { direction: 'up', weekType: '1' });

    // Should only have inner circle / upbound trains
    for (const train of result.lastTrains) {
      expect(['상행', '내선순환'].some(d =>
        train.direction.includes('성수') || // 내선순환 destination
        train.direction.includes('신사') // 신분당선 상행
      )).toBe(true);
    }
  });

  it('should handle direction filter (down)', () => {
    const result = getLastTrainData('강남', { direction: 'down', weekType: '1' });

    // Should only have outer circle / downbound trains
    for (const train of result.lastTrains) {
      expect(['하행', '외선순환'].some(d =>
        train.direction.includes('신도림') || // 외선순환 destination
        train.direction.includes('광교') // 신분당선 하행
      )).toBe(true);
    }
  });

  it('should throw error when station not found', () => {
    expect(() => getLastTrainData('없는역')).toThrow('Station not found in last train data');
  });

  it('should handle weekType parameter (Saturday)', () => {
    const result = getLastTrainData('강남', { weekType: '2' });

    expect(result.lastTrains[0]?.weekType).toBe('토요일');
    expect(result.lastTrains[0]?.weekTypeEn).toBe('Saturday');
  });

  it('should handle weekType parameter (Sunday)', () => {
    const result = getLastTrainData('강남', { weekType: '3' });

    expect(result.lastTrains[0]?.weekType).toBe('일요일/공휴일');
    expect(result.lastTrains[0]?.weekTypeEn).toBe('Sunday/Holiday');

    // Sunday has earlier times
    const line2Inner = result.lastTrains.find(t => t.line === '2호선' && t.destination === '성수');
    expect(line2Inner?.time).toBe('00:02');
  });

  it('should return data for Hongdae', () => {
    const result = getLastTrainData('홍대입구', { weekType: '1' });

    expect(result.station).toBe('홍대입구');
    expect(result.stationEn).toBe('Hongik Univ.');
    expect(result.lastTrains.length).toBeGreaterThan(0);

    // Hongdae has multiple lines
    const lines = [...new Set(result.lastTrains.map(t => t.line))];
    expect(lines).toContain('2호선');
  });

  it('should return data for Seoul Station with multiple lines', () => {
    const result = getLastTrainData('서울역', { weekType: '1' });

    expect(result.station).toBe('서울역');
    expect(result.stationEn).toBe('Seoul Station');

    const lines = [...new Set(result.lastTrains.map(t => t.line))];
    expect(lines).toContain('1호선');
    expect(lines).toContain('4호선');
  });

  it('should auto-detect current week type', () => {
    // Set to Saturday
    vi.setSystemTime(new Date('2025-01-25T12:00:00+09:00')); // Saturday

    const result = getLastTrainData('강남');
    expect(result.lastTrains[0]?.weekType).toBe('토요일');

    // Set to Sunday
    vi.setSystemTime(new Date('2025-01-26T12:00:00+09:00')); // Sunday

    const result2 = getLastTrainData('강남');
    expect(result2.lastTrains[0]?.weekType).toBe('일요일/공휴일');
  });

  it('should include English translations', () => {
    const result = getLastTrainData('강남', { weekType: '1' });

    const train = result.lastTrains[0];
    expect(train?.directionEn).toMatch(/^To /);
    expect(train?.lineEn).toMatch(/Line \d+|Sinbundang Line/);
    expect(train?.destinationEn).toBeTruthy();
  });

  it('should return airport line data', () => {
    const result = getLastTrainData('인천공항1터미널', { weekType: '1' });

    expect(result.station).toBe('인천공항1터미널');
    expect(result.stationEn).toBe('Incheon Airport T1');

    const airportLine = result.lastTrains.find(t => t.line === '공항철도');
    expect(airportLine).toBeDefined();
    expect(airportLine?.lineEn).toBe('Airport Railroad');
  });
});
