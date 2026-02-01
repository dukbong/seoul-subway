import { describe, it, expect } from 'vitest';
import { getExitsData, listAvailableStations } from '../../api/exits/[station].js';

describe('getExitsData', () => {
  it('should return exit data for a valid station', () => {
    const result = getExitsData('강남');

    expect(result).not.toBeNull();
    expect(result?.station).toBe('강남');
    expect(result?.stationEn).toBe('Gangnam');
    expect(result?.line).toBe('2호선');
    expect(result?.exits.length).toBeGreaterThan(0);
  });

  it('should return exit data for Samsung (COEX)', () => {
    const result = getExitsData('삼성');

    expect(result).not.toBeNull();
    expect(result?.station).toBe('삼성');
    expect(result?.stationEn).toBe('Samsung');

    // Check for COEX exit
    const coexExit = result?.exits.find(e => e.landmarkEn.includes('COEX'));
    expect(coexExit).toBeDefined();
    expect(coexExit?.number).toBe(5);
  });

  it('should return exit data for Jamsil (Lotte World)', () => {
    const result = getExitsData('잠실');

    expect(result).not.toBeNull();

    // Check for Lotte World exit
    const lotteWorldExit = result?.exits.find(e => e.landmarkEn.includes('Lotte World'));
    expect(lotteWorldExit).toBeDefined();
    expect(lotteWorldExit?.number).toBe(4);
  });

  it('should return exit data for Gyeongbokgung', () => {
    const result = getExitsData('경복궁');

    expect(result).not.toBeNull();
    expect(result?.line).toBe('3호선');

    // Check for palace exit
    const palaceExit = result?.exits.find(e => e.landmark === '경복궁');
    expect(palaceExit).toBeDefined();
    expect(palaceExit?.number).toBe(5);
  });

  it('should return null for unknown station', () => {
    const result = getExitsData('없는역');

    expect(result).toBeNull();
  });

  it('should include facility types in exit data', () => {
    const result = getExitsData('삼성');

    expect(result).not.toBeNull();
    const coexExit = result?.exits.find(e => e.number === 5);
    expect(coexExit?.facilities).toContain('shopping');
    expect(coexExit?.facilities).toContain('convention');
  });

  it('should include distance information', () => {
    const result = getExitsData('김포공항');

    expect(result).not.toBeNull();
    const lotteMallExit = result?.exits.find(e => e.landmarkEn.includes('Lotte Mall'));
    expect(lotteMallExit?.distance).toBe('direct access');
  });
});

describe('listAvailableStations', () => {
  it('should return a list of stations with exit data', () => {
    const stations = listAvailableStations();

    expect(stations.length).toBeGreaterThan(20);
    expect(stations).toContain('강남');
    expect(stations).toContain('삼성');
    expect(stations).toContain('홍대입구');
    expect(stations).toContain('경복궁');
  });

  it('should include major tourist stations', () => {
    const stations = listAvailableStations();

    const majorStations = [
      '경복궁', '안국', '명동', '잠실', '삼성',
      '홍대입구', '서울역', '김포공항', '이태원',
    ];

    for (const station of majorStations) {
      expect(stations).toContain(station);
    }
  });
});
