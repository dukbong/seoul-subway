import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Service alerts proxy
 *
 * Original API: https://apis.data.go.kr/B553766/ntce/getNtceList
 * Proxy API: /api/alerts?pageNo=1&numOfRows=10&lineNm=2호선
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pageNo, numOfRows, lineNm } = req.query;

  const apiKey = process.env.DATA_GO_KR_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API key not configured' });
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      serviceKey: apiKey,
      dataType: 'JSON',
      pageNo: String(pageNo || '1'),
      numOfRows: String(numOfRows || '10'),
    });

    // Add optional line filter
    if (lineNm) {
      params.append('lineNm', String(lineNm));
    }

    const apiUrl = `https://apis.data.go.kr/B553766/ntce/getNtceList?${params.toString()}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Set cache headers (5 minutes for alerts)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}
