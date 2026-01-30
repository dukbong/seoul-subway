import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Real-time subway arrival information proxy
 *
 * Original API: http://swopenAPI.seoul.go.kr/api/subway/{KEY}/json/realtimeStationArrival/{start}/{end}/{station}
 * Proxy API: /api/realtime/{station}?start=0&end=10
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { station } = req.query;
  const start = req.query.start || '0';
  const end = req.query.end || '10';

  if (!station || typeof station !== 'string') {
    return res.status(400).json({ error: 'Station parameter is required' });
  }

  const apiKey = process.env.SEOUL_OPENAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API key not configured' });
  }

  try {
    const encodedStation = encodeURIComponent(station);
    const apiUrl = `http://swopenAPI.seoul.go.kr/api/subway/${apiKey}/json/realtimeStationArrival/${start}/${end}/${encodedStation}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Set cache headers (30 seconds for real-time data)
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching realtime data:', error);
    return res.status(500).json({ error: 'Failed to fetch realtime data' });
  }
}
