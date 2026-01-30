import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../lib/errors.js';
import { log } from '../lib/logger.js';

export interface AlertsOptions {
  pageNo?: string;
  numOfRows?: string;
  lineNm?: string;
}

/**
 * Fetch service alerts data (testable core logic)
 */
export async function getAlertsData(apiKey: string, options: AlertsOptions = {}) {
  const { pageNo = '1', numOfRows = '10', lineNm } = options;

  const params = new URLSearchParams({
    serviceKey: apiKey,
    dataType: 'JSON',
    pageNo,
    numOfRows,
  });

  if (lineNm) {
    params.append('lineNm', lineNm);
  }

  const apiUrl = `https://apis.data.go.kr/B553766/ntce/getNtceList?${params.toString()}`;

  const response = await fetchWithRetry(apiUrl, { timeout: 8000, retries: 2 });
  return response.json();
}

/**
 * Service alerts proxy
 *
 * Original API: https://apis.data.go.kr/B553766/ntce/getNtceList
 * Proxy API: /api/alerts?pageNo=1&numOfRows=10&lineNm=2호선
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json(createError(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed'));
  }

  const apiKey = process.env.DATA_GO_KR_KEY;
  if (!apiKey) {
    return res.status(500).json(createError(ErrorCodes.API_KEY_ERROR, 'API key not configured'));
  }

  try {
    const { pageNo, numOfRows, lineNm } = req.query;

    const data = await getAlertsData(apiKey, {
      pageNo: pageNo ? String(pageNo) : undefined,
      numOfRows: numOfRows ? String(numOfRows) : undefined,
      lineNm: lineNm ? String(lineNm) : undefined,
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    log({
      level: 'info',
      endpoint: '/api/alerts',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    return res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/alerts',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch alerts')
    );
  }
}
