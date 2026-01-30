# Seoul Subway Proxy Server

Vercel Edge Functions proxy for Seoul Subway API. This server hides API keys from users.

## Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

```bash
cd vercel-proxy
vercel
```

### 3. Set Environment Variables

In Vercel Dashboard (https://vercel.com), go to your project settings:

1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

| Variable | Description | Provider |
|----------|-------------|----------|
| `SEOUL_OPENAPI_KEY` | Seoul Open Data API key | [data.seoul.go.kr](https://data.seoul.go.kr) |
| `DATA_GO_KR_KEY` | Public Data Portal API key | [data.go.kr](https://www.data.go.kr) |

3. Redeploy: `vercel --prod`

## API Endpoints

### Real-time Arrival

```
GET /api/realtime/{station}?start=0&end=10
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| station | Yes | Station name (Korean) |
| start | No | Start index (default: 0) |
| end | No | End index (default: 10) |

Example:
```bash
curl "https://your-proxy.vercel.app/api/realtime/강남"
```

### Station Search

```
GET /api/stations?station={name}&start=1&end=10
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| station | Yes | Station name to search |
| start | No | Start index (default: 1) |
| end | No | End index (default: 10) |

Example:
```bash
curl "https://your-proxy.vercel.app/api/stations?station=강남"
```

### Route Search

```
GET /api/route?dptreStnNm={departure}&arvlStnNm={arrival}&searchDt={datetime}
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| dptreStnNm | Yes | Departure station |
| arvlStnNm | Yes | Arrival station |
| searchDt | No | Search datetime (YYYY-MM-DD HH:mm:ss) |
| searchType | No | duration / distance / transfer |

Example:
```bash
curl "https://your-proxy.vercel.app/api/route?dptreStnNm=신도림&arvlStnNm=서울역"
```

### Service Alerts

```
GET /api/alerts?pageNo=1&numOfRows=10&lineNm={line}
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| pageNo | No | Page number (default: 1) |
| numOfRows | No | Results per page (default: 10) |
| lineNm | No | Filter by line name |

Example:
```bash
curl "https://your-proxy.vercel.app/api/alerts"
```

## Caching

| Endpoint | Cache Duration |
|----------|---------------|
| /api/realtime | 30 seconds |
| /api/stations | 1 hour |
| /api/route | 5 minutes |
| /api/alerts | 5 minutes |

## Local Development

```bash
npm install
vercel dev
```

Note: You need to set environment variables locally:
```bash
export SEOUL_OPENAPI_KEY="your-key"
export DATA_GO_KR_KEY="your-key"
```

Or create a `.env` file (don't commit this!):
```
SEOUL_OPENAPI_KEY=your-key
DATA_GO_KR_KEY=your-key
```

## Cost

Vercel's free tier includes:
- 100,000 Edge Function invocations per day
- Unlimited bandwidth

For small to medium usage, this should be completely free.
