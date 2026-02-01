import { describe, it, expect } from 'vitest';
import {
  parseAlertStatus,
  parseAlertSeverity,
  parseNotice,
  parseAlerts,
} from '../../lib/alertParser.js';
import type { Notice } from '../../lib/types/index.js';

describe('alertParser', () => {
  describe('parseAlertStatus', () => {
    it('should return delayed for delay keywords', () => {
      expect(parseAlertStatus('열차 지연 안내')).toBe('delayed');
      expect(parseAlertStatus('운행지연 안내')).toBe('delayed');
      expect(parseAlertStatus('배차간격 조정')).toBe('delayed');
    });

    it('should return suspended for suspension keywords', () => {
      expect(parseAlertStatus('운행중단 안내')).toBe('suspended');
      expect(parseAlertStatus('열차 사고 발생')).toBe('suspended');
      expect(parseAlertStatus('시스템 장애')).toBe('suspended');
    });

    it('should return normal for regular notices', () => {
      expect(parseAlertStatus('정기 점검 안내')).toBe('normal');
      expect(parseAlertStatus('새로운 역 개통')).toBe('normal');
    });

    it('should check content as well as title', () => {
      expect(parseAlertStatus('안내', '지연 발생')).toBe('delayed');
      expect(parseAlertStatus('안내', '운행중단')).toBe('suspended');
    });

    it('should prioritize suspended over delayed', () => {
      expect(parseAlertStatus('지연으로 인한 운행중단')).toBe('suspended');
    });
  });

  describe('parseAlertSeverity', () => {
    it('should return high for critical keywords', () => {
      expect(parseAlertSeverity('화재 발생')).toBe('high');
      expect(parseAlertSeverity('인명 사고')).toBe('high');
      expect(parseAlertSeverity('긴급 상황')).toBe('high');
    });

    it('should return medium for moderate keywords', () => {
      expect(parseAlertSeverity('열차 지연')).toBe('medium');
      expect(parseAlertSeverity('시스템 점검')).toBe('medium');
    });

    it('should return low for other notices', () => {
      expect(parseAlertSeverity('일반 안내')).toBe('low');
      expect(parseAlertSeverity('역 개통')).toBe('low');
    });
  });

  describe('parseNotice', () => {
    it('should parse a notice with line info', () => {
      const notice: Notice = {
        ntceNo: '1',
        ntceSj: '2호선 열차 지연 안내',
        ntceCn: '혼잡으로 인한 지연',
        lineNm: '2호선',
        regDt: '2024-01-15',
      };

      const result = parseNotice(notice);

      expect(result.lineName).toBe('2호선');
      expect(result.lineNameEn).toBe('Line 2');
      expect(result.lineId).toBe('1002');
      expect(result.status).toBe('delayed');
      expect(result.severity).toBe('medium');
      expect(result.title).toBe('2호선 열차 지연 안내');
    });

    it('should extract line from title if lineNm is missing', () => {
      const notice: Notice = {
        ntceNo: '1',
        ntceSj: '신분당선 점검 안내',
        regDt: '2024-01-15',
      };

      const result = parseNotice(notice);

      expect(result.lineName).toBe('신분당선');
      expect(result.lineNameEn).toBe('Sinbundang Line');
    });

    it('should default to all lines if no line info found', () => {
      const notice: Notice = {
        ntceNo: '1',
        ntceSj: '일반 안내',
        regDt: '2024-01-15',
      };

      const result = parseNotice(notice);

      expect(result.lineName).toBe('전체노선');
    });
  });

  describe('parseAlerts', () => {
    it('should generate summary with delayed and normal lines', () => {
      const notices: Notice[] = [
        {
          ntceNo: '1',
          ntceSj: '2호선 지연',
          lineNm: '2호선',
          regDt: '2024-01-15',
        },
        {
          ntceNo: '2',
          ntceSj: '3호선 운행중단',
          lineNm: '3호선',
          regDt: '2024-01-15',
        },
      ];

      const result = parseAlerts(notices);

      expect(result.summary.delayedLines).toContain('2호선');
      expect(result.summary.suspendedLines).toContain('3호선');
      expect(result.summary.normalLines).toContain('1호선');
      expect(result.summary.normalLines).not.toContain('2호선');
      expect(result.summary.normalLines).not.toContain('3호선');
    });

    it('should return all alerts in structured format', () => {
      const notices: Notice[] = [
        {
          ntceNo: '1',
          ntceSj: '1호선 점검 안내',
          lineNm: '1호선',
          regDt: '2024-01-15',
        },
      ];

      const result = parseAlerts(notices);

      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0]?.lineName).toBe('1호선');
      expect(result.alerts[0]?.lineNameEn).toBe('Line 1');
    });

    it('should handle empty notices', () => {
      const result = parseAlerts([]);

      expect(result.alerts).toHaveLength(0);
      expect(result.summary.normalLines).toHaveLength(13); // All lines are normal
      expect(result.summary.delayedLines).toHaveLength(0);
      expect(result.summary.suspendedLines).toHaveLength(0);
    });

    it('should prioritize suspended over delayed for same line', () => {
      const notices: Notice[] = [
        {
          ntceNo: '1',
          ntceSj: '2호선 지연',
          lineNm: '2호선',
          regDt: '2024-01-15',
        },
        {
          ntceNo: '2',
          ntceSj: '2호선 운행중단',
          lineNm: '2호선',
          regDt: '2024-01-15',
        },
      ];

      const result = parseAlerts(notices);

      expect(result.summary.suspendedLines).toContain('2호선');
      expect(result.summary.delayedLines).not.toContain('2호선');
    });
  });
});
