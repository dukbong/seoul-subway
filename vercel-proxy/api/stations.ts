import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Station search proxy
 *
 * Original API: http://openapi.seoul.go.kr:8088/{KEY}/json/SearchInfoBySubwayNameService/{start}/{end}/{station}
 * Proxy API: /api/stations?station=강남&start=1&end=10
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { station, start, end } = req.query;

  if (!station || typeof station !== 'string') {
    return res.status(400).json({ error: 'Station parameter is required' });
  }

  const apiKey = process.env.SEOUL_OPENAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API key not configured' });
  }

  try {
    const startIdx = start || '1';
    const endIdx = end || '10';
    const encodedStation = encodeURIComponent(station);
    const apiUrl = `http://openapi.seoul.go.kr:8088/${apiKey}/json/SearchInfoBySubwayNameService/${startIdx}/${endIdx}/${encodedStation}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Set cache headers (1 hour for station data - rarely changes)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching station data:', error);
    return res.status(500).json({ error: 'Failed to fetch station data' });
  }
}
