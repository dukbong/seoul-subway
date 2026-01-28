---
name: seoul-subway
description: Seoul Metro real-time arrival, route search, service alerts
metadata: {"moltbot":{"emoji":"🚇","requires":{"bins":["curl","jq"]},"config":{"requiredEnv":["SEOUL_OPENAPI_KEY","DATA_GO_KR_KEY"]}}}
homepage: https://github.com/dukbong/seoul-subway
user-invocable: true
---

# Seoul Subway Skill

Query real-time Seoul Metro information.

## Features

### 1. Real-time Arrival Info
Get train arrival times by station name.

**Trigger examples:**
- "강남역 도착정보"
- "홍대입구역 언제 와?"
- "신도림 지하철 도착"

**API:** `http://swopenAPI.seoul.go.kr/api/subway/{SEOUL_OPENAPI_KEY}/json/realtimeStationArrival/{startIndex}/{endIndex}/{stationName}`

**Response fields:**
- `subwayId`: Line ID (1002=Line 2, 1077=Sinbundang, etc.)
- `trainLineNm`: Train direction (e.g., "성수행 - 역삼방면")
- `arvlMsg2`: Arrival message (e.g., "4분 20초 후")
- `arvlMsg3`: Current location (e.g., "방배")
- `btrainSttus`: Train type (일반/급행)
- `lstcarAt`: Last train flag (0: No, 1: Yes)

### 2. Station Search
Get line and station code info by station name.

**Trigger examples:**
- "강남역 정보"
- "강남역 몇호선?"
- "신도림역 검색"

**API:** `http://openapi.seoul.go.kr:8088/{SEOUL_OPENAPI_KEY}/json/SearchInfoBySubwayNameService/{startIndex}/{endIndex}/{stationName}`

**Response fields:**
- `STATION_CD`: Station code
- `STATION_NM`: Station name
- `LINE_NUM`: Line name (e.g., "02호선", "신분당선")
- `FR_CODE`: External station code

### 3. Route Search
Find the shortest route between stations.

**Trigger examples:**
- "신도림에서 서울역"
- "강남에서 홍대까지"
- "잠실역에서 여의도역 어떻게 가?"

**API:** `https://apis.data.go.kr/B553766/path/getShtrmPath`

**Required parameters:**
- `serviceKey`: DATA_GO_KR_KEY
- `dptreStnNm`: Departure station name
- `arvlStnNm`: Arrival station name
- `searchDt`: Search datetime (yyyy-MM-dd HH:mm:ss) - **Required**
- `dataType`: JSON

**Optional parameters:**
- `searchType`: duration (fastest), distance (shortest), transfer (fewest transfers)
- `exclTrfstnNms`: Excluded transfer stations (comma separated)
- `thrghStnNms`: Via stations (comma separated)
- `schInclYn`: Include train schedule (default: Y)

**Response fields:**
- `totalDstc`: Total distance (m)
- `totalreqHr`: Total time (seconds)
- `totalCardCrg`: Fare (KRW)
- `paths[]`: Route details
  - `dptreStn`, `arvlStn`: Departure/arrival station info
  - `trainno`: Train number
  - `trainDptreTm`, `trainArvlTm`: Departure/arrival time
  - `trsitYn`: Transfer flag

### 4. Service Alerts
Get delay, incident, and express stop information.

**Trigger examples:**
- "지하철 지연 있어?"
- "오늘 지하철 상황"
- "지하철 운행 알림"

**API:** `https://apis.data.go.kr/B553766/ntce/getNtceList`

**Parameters:**
- `serviceKey`: DATA_GO_KR_KEY
- `dataType`: JSON
- `pageNo`: Page number
- `numOfRows`: Results per page
- `lineNm`: Line name (optional)

**Response fields:**
- `noftTtl`: Alert title
- `noftCn`: Alert content
- `noftOcrnDt`: Alert timestamp
- `lineNmLst`: Affected line(s)
- `noftSeCd`: Alert type code
- `nonstopYn`: Non-stop flag
- `upbdnbSe`: Up/down direction
- `xcseSitnBgngDt`, `xcseSitnEndDt`: Incident start/end time

## Environment Variables

| Variable | Usage | Provider |
|----------|-------|----------|
| `SEOUL_OPENAPI_KEY` | Arrival info, station search | data.seoul.go.kr |
| `DATA_GO_KR_KEY` | Route search, alerts | data.go.kr |

## Line ID Mapping

| Line | subwayId |
|------|----------|
| Line 1 | 1001 |
| Line 2 | 1002 |
| Line 3 | 1003 |
| Line 4 | 1004 |
| Line 5 | 1005 |
| Line 6 | 1006 |
| Line 7 | 1007 |
| Line 8 | 1008 |
| Line 9 | 1009 |
| Sinbundang | 1077 |
| Gyeongui-Jungang | 1063 |
| Airport Railroad | 1065 |
| Gyeongchun | 1067 |
| Suin-Bundang | 1075 |

## Usage Examples

### Get Arrival Info
```bash
curl "http://swopenAPI.seoul.go.kr/api/subway/${SEOUL_OPENAPI_KEY}/json/realtimeStationArrival/0/10/강남"
```

### Search Station
```bash
curl "http://openapi.seoul.go.kr:8088/${SEOUL_OPENAPI_KEY}/json/SearchInfoBySubwayNameService/1/10/강남"
```

### Search Route
```bash
# Korean parameters must be URL-encoded with --data-urlencode
curl -G "https://apis.data.go.kr/B553766/path/getShtrmPath?serviceKey=${DATA_GO_KR_KEY}&dataType=JSON" \
  --data-urlencode "dptreStnNm=신도림" \
  --data-urlencode "arvlStnNm=서울역" \
  --data-urlencode "searchDt=$(date '+%Y-%m-%d %H:%M:%S')"
```

### Get Service Alerts
```bash
curl "https://apis.data.go.kr/B553766/ntce/getNtceList?serviceKey=${DATA_GO_KR_KEY}&dataType=JSON&pageNo=1&numOfRows=10"
```

## Output Format Guide

Follow these formats when responding to users.

### 1. Real-time Arrival Info

```
[강남역 Arrival Info]

| Line | Direction | Arrival | Location | Type |
|------|-----------|---------|----------|------|
| Line 2 | 성수행 | 3 min | 역삼 | Regular |
| Line 2 | 신도림행 | 5 min | 교대 | Express |
| Sinbundang | 광교행 | 2 min | 양재시민의숲 | Regular |

Note: Add "Last train" indicator when applicable.
```

### 2. Station Search

```
[강남역]

| Line | Station Code | External Code |
|------|--------------|---------------|
| Line 2 | 222 | 0222 |
| Sinbundang | D7 | D07 |
```

### 3. Route Search

```
[강남 -> 홍대입구]

Time: 38 min | Distance: 22.1 km | Fare: 1,650 KRW | Transfers: 1

Route:
1. 09:03 Depart 강남 (Line 2 towards 성수)
2. 09:18 Transfer at 신도림 (Line 2 -> Line 1)
3. 09:42 Arrive 홍대입구

Note: Include specific times when train schedule is available.
```

### 4. Service Alerts

```
[Service Alerts]

[Line 1] 종로3가역 Non-stop
Period: 15:00 ~ 15:22
Reason: Due to smoke from Korail train

---

[Line 2] Normal operation

Note: If no alerts, respond with "All lines operating normally."
```

### Error Response

```
Error: Station not found.
Try searching with "강남" (station name only).
```
