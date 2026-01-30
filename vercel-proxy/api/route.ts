import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Route search proxy
 *
 * Original API: https://apis.data.go.kr/B553766/path/getShtrmPath
 * Proxy API: /api/route?dptreStnNm=신도림&arvlStnNm=서울역&searchDt=2024-01-01%2012:00:00
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dptreStnNm, arvlStnNm, searchDt, searchType } = req.query;

  if (!dptreStnNm || !arvlStnNm) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['dptreStnNm', 'arvlStnNm'],
      optional: ['searchDt', 'searchType']
    });
  }

  const apiKey = process.env.DATA_GO_KR_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API key not configured' });
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      serviceKey: apiKey,
      dataType: 'JSON',
      dptreStnNm: String(dptreStnNm),
      arvlStnNm: String(arvlStnNm),
    });

    // Add optional parameters
    if (searchDt) {
      params.append('searchDt', String(searchDt));
    } else {
      // Default to current time
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
      params.append('searchDt', formatted);
    }

    if (searchType) {
      params.append('searchType', String(searchType));
    }

    const apiUrl = `https://apis.data.go.kr/B553766/path/getShtrmPath?${params.toString()}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Set cache headers (5 minutes for route data)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching route data:', error);
    return res.status(500).json({ error: 'Failed to fetch route data' });
  }
}
