import { describe, it, expect } from 'vitest';
import { matchStation, suggestStations } from '../../lib/stationMatcher.js';

describe('stationMatcher', () => {
  describe('matchStation', () => {
    it('should match case-insensitive English names', () => {
      expect(matchStation('gangnam')).toBe('강남');
      expect(matchStation('GANGNAM')).toBe('강남');
      expect(matchStation('GangNam')).toBe('강남');
    });

    it('should match with spaces removed', () => {
      expect(matchStation('Gang nam')).toBe('강남');
      expect(matchStation('Seoul Station')).toBe('서울역');
      expect(matchStation('seoul station')).toBe('서울역');
    });

    it('should match university aliases', () => {
      expect(matchStation('Hongik University')).toBe('홍대입구');
      expect(matchStation('Hongik Univ')).toBe('홍대입구');
      expect(matchStation('hongdae')).toBe('홍대입구');
      expect(matchStation('SNU')).toBe('서울대입구');
      expect(matchStation('Seoul National University')).toBe('서울대입구');
      expect(matchStation('Ewha')).toBe('이대');
    });

    it('should match airport aliases', () => {
      expect(matchStation('ICN Airport')).toBe('인천공항1터미널');
      expect(matchStation('Incheon Airport')).toBe('인천공항1터미널');
      expect(matchStation('ICN T1')).toBe('인천공항1터미널');
      expect(matchStation('ICN T2')).toBe('인천공항2터미널');
      expect(matchStation('Gimpo')).toBe('김포공항');
    });

    it('should match terminal aliases', () => {
      expect(matchStation('Express Bus Terminal')).toBe('고속터미널');
      expect(matchStation('Express Terminal')).toBe('고속터미널');
    });

    it('should match landmark aliases', () => {
      expect(matchStation('Coex')).toBe('삼성');
      expect(matchStation('Lotte World')).toBe('잠실');
      expect(matchStation('Gyeongbok Palace')).toBe('경복궁');
      expect(matchStation('N Seoul Tower')).toBe('명동');
    });

    it('should pass through Korean input as-is', () => {
      expect(matchStation('강남')).toBe('강남');
      expect(matchStation('홍대입구')).toBe('홍대입구');
      expect(matchStation('서울역')).toBe('서울역');
    });

    it('should return null for unknown stations', () => {
      expect(matchStation('Unknown Station')).toBeNull();
      expect(matchStation('asdfasdf')).toBeNull();
      expect(matchStation('New York')).toBeNull();
    });

    it('should match with Levenshtein distance 1 (fuzzy matching)', () => {
      // One character added
      expect(matchStation('gangnamm')).toBe('강남');
      // One character substituted
      expect(matchStation('gangnem')).toBe('강남');
      // Note: 'gangam' matches '장암' (jangam) with distance 1
    });

    it('should NOT match with Levenshtein distance > 1', () => {
      // 2+ character difference
      expect(matchStation('gngam')).toBeNull();
      expect(matchStation('gngnm')).toBeNull();
    });

    it('should match new university aliases', () => {
      expect(matchStation('yonsei')).toBe('신촌');
      expect(matchStation('Yonsei University')).toBe('신촌');
      expect(matchStation('sogang')).toBe('신촌');
      expect(matchStation('hanyang')).toBe('왕십리');
      expect(matchStation('CAU')).toBe('흑석');
      expect(matchStation('SKKU')).toBe('혜화');
    });

    it('should match new landmark and airport aliases', () => {
      expect(matchStation('DDP')).toBe('동대문역사문화공원');
      expect(matchStation('GMP')).toBe('김포공항');
      expect(matchStation('ICN')).toBe('인천공항1터미널');
    });

    it('should handle special characters', () => {
      expect(matchStation('Seoul-Station')).toBe('서울역');
      expect(matchStation('Seoul_Station')).toBe('서울역');
      expect(matchStation('Seoul.Station')).toBe('서울역');
    });
  });

  describe('suggestStations', () => {
    it('should suggest similar stations for typos', () => {
      const suggestions = suggestStations('Gangnum');
      expect(suggestions).toContain('강남');
    });

    it('should suggest similar stations for minor spelling errors', () => {
      const suggestions = suggestStations('Hongdea');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return empty array for completely unrelated input', () => {
      const suggestions = suggestStations('xyzabcdefghijklmnop');
      expect(suggestions).toEqual([]);
    });

    it('should limit suggestions to specified number', () => {
      const suggestions = suggestStations('gang', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should not include duplicate Korean station names', () => {
      const suggestions = suggestStations('samsung');
      const uniqueSuggestions = [...new Set(suggestions)];
      expect(suggestions.length).toBe(uniqueSuggestions.length);
    });
  });
});
