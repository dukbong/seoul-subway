import type { Notice } from './types/index.js';

export type AlertStatus = 'normal' | 'delayed' | 'suspended';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface ParsedAlert {
  lineId: string;
  lineName: string;
  lineNameEn: string;
  status: AlertStatus;
  severity: AlertSeverity;
  title: string;
  titleEn: string;
  content?: string;
  registeredAt: string;
}

export interface AlertSummary {
  delayedLines: string[];
  suspendedLines: string[];
  normalLines: string[];
}

export interface EnhancedAlertsResponse {
  summary: AlertSummary;
  alerts: ParsedAlert[];
}

// All Seoul subway lines
const ALL_LINES = [
  '1호선', '2호선', '3호선', '4호선', '5호선',
  '6호선', '7호선', '8호선', '9호선',
  '신분당선', '경의중앙선', '공항철도', '수인분당선',
];

// Line name to ID mapping
const LINE_ID_MAP: Record<string, string> = {
  '1호선': '1001',
  '2호선': '1002',
  '3호선': '1003',
  '4호선': '1004',
  '5호선': '1005',
  '6호선': '1006',
  '7호선': '1007',
  '8호선': '1008',
  '9호선': '1009',
  '신분당선': '1077',
  '경의중앙선': '1063',
  '공항철도': '1065',
  '수인분당선': '1075',
};

// Line name English mapping
const LINE_NAME_EN_MAP: Record<string, string> = {
  '1호선': 'Line 1',
  '2호선': 'Line 2',
  '3호선': 'Line 3',
  '4호선': 'Line 4',
  '5호선': 'Line 5',
  '6호선': 'Line 6',
  '7호선': 'Line 7',
  '8호선': 'Line 8',
  '9호선': 'Line 9',
  '신분당선': 'Sinbundang Line',
  '경의중앙선': 'Gyeongui-Jungang Line',
  '공항철도': 'Airport Railroad',
  '수인분당선': 'Suin-Bundang Line',
};

// Keywords indicating delay
const DELAY_KEYWORDS = [
  '지연', '운행지연', '열차지연', '배차간격', '운행조정',
  '혼잡', '연착', '서행', '대기', '지체',
];

// Keywords indicating suspension
const SUSPENSION_KEYWORDS = [
  '운행중단', '중단', '운휴', '운행정지', '운전중지',
  '사고', '장애', '고장', '중지',
];

// Keywords indicating high severity
const HIGH_SEVERITY_KEYWORDS = [
  '사고', '화재', '인명', '응급', '긴급', '운행중단', '중단',
];

// Keywords indicating medium severity
const MEDIUM_SEVERITY_KEYWORDS = [
  '지연', '혼잡', '장애', '점검', '고장',
];

// Title patterns for English translation
const TITLE_PATTERNS: { pattern: RegExp; en: string }[] = [
  { pattern: /안전점검/, en: 'Safety Inspection' },
  { pattern: /신호(장애|고장)/, en: 'Signal Failure' },
  { pattern: /열차(고장|장애)/, en: 'Train Malfunction' },
  { pattern: /인명사고/, en: 'Passenger Incident' },
  { pattern: /화재/, en: 'Fire Emergency' },
  { pattern: /기상(이변|악화)|폭설|폭우|태풍/, en: 'Weather Conditions' },
  { pattern: /혼잡/, en: 'Congestion' },
  { pattern: /점검/, en: 'Maintenance' },
  { pattern: /공사/, en: 'Construction Work' },
  { pattern: /정전/, en: 'Power Outage' },
  { pattern: /스크린도어|안전문/, en: 'Platform Screen Door Issue' },
  { pattern: /선로(이상|장애)/, en: 'Track Issue' },
  { pattern: /차량(고장|장애)/, en: 'Train Car Malfunction' },
  { pattern: /승객(사고|부상)/, en: 'Passenger Accident' },
  { pattern: /의료|응급/, en: 'Medical Emergency' },
];

/**
 * Determine alert status from content
 */
export function parseAlertStatus(title: string, content?: string): AlertStatus {
  const text = `${title} ${content ?? ''}`.toLowerCase();

  for (const keyword of SUSPENSION_KEYWORDS) {
    if (text.includes(keyword)) {
      return 'suspended';
    }
  }

  for (const keyword of DELAY_KEYWORDS) {
    if (text.includes(keyword)) {
      return 'delayed';
    }
  }

  return 'normal';
}

/**
 * Determine alert severity from content
 */
export function parseAlertSeverity(title: string, content?: string): AlertSeverity {
  const text = `${title} ${content ?? ''}`.toLowerCase();

  for (const keyword of HIGH_SEVERITY_KEYWORDS) {
    if (text.includes(keyword)) {
      return 'high';
    }
  }

  for (const keyword of MEDIUM_SEVERITY_KEYWORDS) {
    if (text.includes(keyword)) {
      return 'medium';
    }
  }

  return 'low';
}

/**
 * Extract line name from notice
 */
function extractLineName(notice: Notice): string {
  // Use lineNm field if available
  if (notice.lineNm) {
    return notice.lineNm;
  }

  // Try to extract from title
  const title = notice.ntceSj || '';
  for (const line of ALL_LINES) {
    if (title.includes(line)) {
      return line;
    }
  }

  return '전체노선';
}

/**
 * Generate English title from Korean title with keyword-based translation
 */
function generateEnglishTitle(title: string, lineName: string, status: AlertStatus): string {
  const lineEn = LINE_NAME_EN_MAP[lineName] || lineName;

  // Keyword-based detailed translation
  for (const { pattern, en } of TITLE_PATTERNS) {
    if (pattern.test(title)) {
      if (status === 'suspended') return `${lineEn}: ${en} - Service Suspended`;
      if (status === 'delayed') return `${lineEn}: ${en} - Delays Expected`;
      return `${lineEn}: ${en}`;
    }
  }

  // Default fallback
  if (status === 'suspended') return `${lineEn}: Service Suspended`;
  if (status === 'delayed') return `${lineEn}: Service Delayed`;
  return `${lineEn}: Service Notice`;
}

/**
 * Parse a single notice into a structured alert
 */
export function parseNotice(notice: Notice): ParsedAlert {
  const title = notice.ntceSj || '';
  const content = notice.ntceCn;
  const lineName = extractLineName(notice);
  const status = parseAlertStatus(title, content);
  const severity = parseAlertSeverity(title, content);

  return {
    lineId: LINE_ID_MAP[lineName] || '0000',
    lineName,
    lineNameEn: LINE_NAME_EN_MAP[lineName] || lineName,
    status,
    severity,
    title,
    titleEn: generateEnglishTitle(title, lineName, status),
    content,
    registeredAt: notice.regDt,
  };
}

/**
 * Parse notices and generate enhanced response with summary
 */
export function parseAlerts(notices: Notice[]): EnhancedAlertsResponse {
  const alerts = notices.map(parseNotice);

  // Group alerts by line
  const lineStatusMap = new Map<string, AlertStatus>();

  for (const alert of alerts) {
    const currentStatus = lineStatusMap.get(alert.lineName);
    // Priority: suspended > delayed > normal
    if (alert.status === 'suspended') {
      lineStatusMap.set(alert.lineName, 'suspended');
    } else if (alert.status === 'delayed' && currentStatus !== 'suspended') {
      lineStatusMap.set(alert.lineName, 'delayed');
    } else if (!currentStatus) {
      lineStatusMap.set(alert.lineName, alert.status);
    }
  }

  // Generate summary
  const delayedLines: string[] = [];
  const suspendedLines: string[] = [];
  const normalLines: string[] = [];

  // Check all lines, not just those with alerts
  for (const line of ALL_LINES) {
    const status = lineStatusMap.get(line);
    if (status === 'suspended') {
      suspendedLines.push(line);
    } else if (status === 'delayed') {
      delayedLines.push(line);
    } else {
      normalLines.push(line);
    }
  }

  return {
    summary: {
      delayedLines,
      suspendedLines,
      normalLines,
    },
    alerts,
  };
}
