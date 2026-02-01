import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchWithRetry } from '../../lib/fetchWithRetry.js';
import { createError, ErrorCodes } from '../../lib/errors.js';
import { log } from '../../lib/logger.js';
import { matchStation, suggestStations, getEnglishName } from '../../lib/stationMatcher.js';
import type { QuickExitInfo, QuickExitData } from '../../lib/types/index.js';
import { formatQuickExitInfo } from '../../lib/accessibilityFormatter.js';
import type { Language } from '../../lib/formatter.js';

type FacilityType = 'elevator' | 'escalator' | 'exit' | 'all';

const BASE_URL = 'http://openapi.seoul.go.kr:8088';

/**
 * Fetch quick exit data from Seoul Open API
 */
async function fetchQuickExitData(
  station: string,
  apiKey: string
): Promise<QuickExitData> {
  const result: QuickExitData = {
    station,
    stationEn: getEnglishName(station),
    quickExits: [],
  };

  try {
    const url = `${BASE_URL}/${apiKey}/json/getFstExit/1/1000/`;
    const response = await fetchWithRetry(url, { timeout: 10000, retries: 1 });
    if (!response.ok) return result;

    const data = await response.json();

    // Handle both response structures
    let rawItems: Record<string, unknown>[] = [];
    if (data?.response?.body?.items?.item) {
      rawItems = data.response.body.items.item;
    } else if (data?.getFstExit?.row) {
      rawItems = data.getFstExit.row;
    }

    // Map API field names to our interface fields
    const items: QuickExitInfo[] = rawItems.map((item: Record<string, unknown>) => ({
      lineNm: (item.SW_NM || item.lineNm) as string,
      stnNm: (item.SBWAY_STTN_NM || item.stnNm) as string,
      stnCd: (item.STN_CD || item.stnCd) as string | undefined,
      stnNo: (item.STN_NO || item.stnNo) as string | undefined,
      upbdnbSe: (item.UPBDNB_SE || item.upbdnbSe) as string | undefined,
      drtnInfo: (item.DRTN_INFO || item.drtnInfo) as string | undefined,
      qckgffVhclDoorNo: (item.QCKGFF_VHCL_DOOR_NO || item.qckgffVhclDoorNo) as string | undefined,
      plfmCmgFac: (item.PLFM_CMG_FAC || item.plfmCmgFac) as string | undefined,
      facNo: (item.FAC_NO || item.facNo) as string | undefined,
      elvtrNo: (item.ELVTR_NO || item.elvtrNo) as string | undefined,
      fwkPstnNm: (item.FWK_PSTN_NM || item.fwkPstnNm) as string | undefined,
      facPstnNm: (item.FAC_PSTN_NM || item.facPstnNm) as string | undefined,
      crtrYmd: (item.CRTR_YMD || item.crtrYmd) as string | undefined,
      // Legacy fields for backward compatibility
      updnLine: (item.UPDNLN_SE || item.updnLine) as string | undefined,
      drtn: (item.DRTN || item.drtn) as string | undefined,
      exitNo: (item.EXIT_NO || item.exitNo) as string | undefined,
      stairNo: (item.STAIR_NO || item.stairNo) as string | undefined,
      esctrNo: (item.ESCTR_NO || item.esctrNo) as string | undefined,
      fstCarNo: (item.FST_CAR_NO || item.fstCarNo) as string | undefined,
      fstDoorNo: (item.FST_DOOR_NO || item.fstDoorNo) as string | undefined,
      remark: (item.REMARK || item.remark) as string | undefined,
    }));

    // Filter by station name
    result.quickExits = items.filter(item => item.stnNm === station);
  } catch (error) {
    console.error('Error fetching quick exit data:', error);
  }

  return result;
}

/**
 * Quick exit information API
 *
 * GET /api/quick-exit/{station}
 * Query params:
 * - facility: elevator | escalator | exit | all (default: all)
 * - format: formatted (markdown) | raw (JSON)
 * - lang: ko | en
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json(createError(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed'));
  }

  const { station } = req.query;
  if (!station || typeof station !== 'string') {
    return res.status(400).json(
      createError(ErrorCodes.MISSING_PARAM, 'Station parameter is required', { required: ['station'] })
    );
  }

  // Normalize station name
  const normalizedStation = matchStation(station);
  if (!normalizedStation) {
    const suggestions = suggestStations(station);
    return res.status(400).json(
      createError(ErrorCodes.INVALID_STATION, 'Station not found', {
        input: station,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        hint: 'Try Korean name directly or check spelling',
      })
    );
  }

  const apiKey = process.env.SEOUL_OPENAPI_KEY;
  if (!apiKey) {
    return res.status(500).json(createError(ErrorCodes.API_KEY_ERROR, 'API key not configured'));
  }

  // Parse query params
  const facilityParam = (req.query.facility as string) || 'all';
  const facility: FacilityType = ['elevator', 'escalator', 'exit', 'all'].includes(facilityParam)
    ? (facilityParam as FacilityType)
    : 'all';
  const format = (req.query.format as string) || 'formatted';
  const lang: Language = (req.query.lang as Language) === 'en' ? 'en' : 'ko';

  try {
    const data = await fetchQuickExitData(normalizedStation, apiKey);

    // Long cache for quick exit info (doesn't change frequently)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    log({
      level: 'info',
      endpoint: '/api/quick-exit',
      method: req.method,
      duration: Date.now() - startTime,
      status: 200,
    });

    // Return raw JSON if requested
    if (format === 'raw') {
      return res.status(200).json(data);
    }

    // Return formatted markdown
    const formatted = formatQuickExitInfo(data, lang, facility);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(formatted);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log({
      level: 'error',
      endpoint: '/api/quick-exit',
      method: req.method,
      duration: Date.now() - startTime,
      error: errorMessage,
    });

    return res.status(500).json(
      createError(ErrorCodes.EXTERNAL_API_ERROR, 'Failed to fetch quick exit data')
    );
  }
}
