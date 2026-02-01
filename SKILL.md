---
name: seoul-subway
description: Seoul Subway assistant for real-time arrivals, route planning, and service alerts (Korean/English)
model: sonnet
metadata: {"moltbot":{"emoji":"🚇","requires":{"bins":["curl","jq"]}}}
homepage: https://github.com/dukbong/seoul-subway
user-invocable: true
---

# Seoul Subway Skill

Query real-time Seoul Subway information. **No API key required** - uses proxy server.

## Features

| Feature | Description | Trigger Example (KO) | Trigger Example (EN) |
|---------|-------------|----------------------|----------------------|
| Real-time Arrival | Train arrival times by station | "강남역 도착정보" | "Gangnam station arrivals" |
| Station Search | Line and station code lookup | "강남역 몇호선?" | "What line is Gangnam?" |
| Route Search | Shortest path with time/fare | "신도림에서 서울역" | "Sindorim to Seoul Station" |
| Service Alerts | Delays, incidents, non-stops | "지하철 지연 있어?" | "Any subway delays?" |
| **Last Train** | Last train times by station | "홍대 막차 몇 시야?" | "Last train to Hongdae?" |
| **Exit Info** | Exit numbers for landmarks | "코엑스 몇 번 출구?" | "Which exit for COEX?" |

### Natural Language Triggers / 자연어 트리거

다양한 자연어 표현을 인식합니다:

#### Real-time Arrival / 실시간 도착
| English | 한국어 |
|---------|--------|
| "When's the next train at Gangnam?" | "강남 몇 분 남았어?" |
| "Trains at Gangnam" | "강남 열차" |
| "Gangnam arrivals" | "강남 언제 와?" |
| "Next train to Gangnam" | "다음 열차 강남" |

#### Route Search / 경로 검색
| English | 한국어 |
|---------|--------|
| "How do I get to Seoul Station from Gangnam?" | "강남에서 서울역 어떻게 가?" |
| "Gangnam → Seoul Station" | "강남 → 서울역" |
| "Gangnam to Seoul Station" | "강남에서 서울역 가는 길" |
| "Route from Gangnam to Hongdae" | "강남부터 홍대까지" |

#### Service Alerts / 운행 알림
| English | 한국어 |
|---------|--------|
| "Is Line 2 running normally?" | "2호선 정상 운행해?" |
| "Any delays on Line 1?" | "1호선 지연 있어?" |
| "Subway status" | "지하철 상황" |
| "Line 3 alerts" | "3호선 알림" |

#### Last Train / 막차 시간
| English | 한국어 |
|---------|--------|
| "Last train to Gangnam?" | "강남 막차 몇 시야?" |
| "When is the last train at Hongdae?" | "홍대입구 막차 시간" |
| "Final train to Seoul Station" | "서울역 막차" |
| "Last train on Saturday?" | "토요일 막차 시간" |

#### Exit Info / 출구 정보
| English | 한국어 |
|---------|--------|
| "Which exit for COEX?" | "코엑스 몇 번 출구?" |
| "Exit for Lotte World" | "롯데월드 출구" |
| "DDP which exit?" | "DDP 몇 번 출구?" |
| "Gyeongbokgung Palace exit" | "경복궁 나가는 출구" |

---

## First Time Setup / 첫 사용 안내

When you first use this skill, you'll see a permission prompt for the proxy domain.

처음 사용 시 프록시 도메인 접근 확인 창이 뜹니다.

**Select / 선택:** `Yes, and don't ask again for vercel-proxy-henna-eight.vercel.app`

This only needs to be done once. / 한 번만 하면 됩니다.

---

## Proxy API Reference

All API calls go through the proxy server. No API keys needed for users.

### Base URL

```
https://vercel-proxy-henna-eight.vercel.app
```

### 1. Real-time Arrival Info

**Endpoint**
```
GET /api/realtime/{station}?start=0&end=10
```

**Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| station | Yes | Station name (Korean, URL-encoded) |
| start | No | Start index (default: 0) |
| end | No | End index (default: 10) |

**Response Fields**

| Field | Description |
|-------|-------------|
| `subwayId` | Line ID (1002=Line 2, 1077=Sinbundang) |
| `trainLineNm` | Direction (e.g., "성수행 - 역삼방면") |
| `arvlMsg2` | Arrival time (e.g., "4분 20초 후") |
| `arvlMsg3` | Current location |
| `btrainSttus` | Train type (일반/급행) |
| `lstcarAt` | Last train (0=No, 1=Yes) |

**Example**
```bash
curl "https://vercel-proxy-henna-eight.vercel.app/api/realtime/강남"
```

---

### 2. Station Search

**Endpoint**
```
GET /api/stations?station={name}&start=1&end=10
```

**Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| station | Yes | Station name to search |
| start | No | Start index (default: 1) |
| end | No | End index (default: 10) |

**Response Fields**

| Field | Description |
|-------|-------------|
| `STATION_CD` | Station code |
| `STATION_NM` | Station name |
| `LINE_NUM` | Line name (e.g., "02호선") |
| `FR_CODE` | External station code |

**Example**
```bash
curl "https://vercel-proxy-henna-eight.vercel.app/api/stations?station=강남"
```

---

### 3. Route Search

**Endpoint**
```
GET /api/route?dptreStnNm={departure}&arvlStnNm={arrival}
```

**Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| dptreStnNm | Yes | Departure station |
| arvlStnNm | Yes | Arrival station |
| searchDt | No | Datetime (yyyy-MM-dd HH:mm:ss) |
| searchType | No | duration / distance / transfer |

**Response Fields**

| Field | Description |
|-------|-------------|
| `totalDstc` | Total distance (m) |
| `totalreqHr` | Total time (seconds) |
| `totalCardCrg` | Fare (KRW) |
| `paths[].trainno` | Train number |
| `paths[].trainDptreTm` | Departure time |
| `paths[].trainArvlTm` | Arrival time |
| `paths[].trsitYn` | Transfer flag |

**Example**
```bash
curl "https://vercel-proxy-henna-eight.vercel.app/api/route?dptreStnNm=신도림&arvlStnNm=서울역"
```

---

### 4. Service Alerts

**Endpoint**
```
GET /api/alerts?pageNo=1&numOfRows=10&format=enhanced
```

**Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| pageNo | No | Page number (default: 1) |
| numOfRows | No | Results per page (default: 10) |
| lineNm | No | Filter by line |
| format | No | `default` or `enhanced` (structured response) |

**Response Fields (Default)**

| Field | Description |
|-------|-------------|
| `noftTtl` | Alert title |
| `noftCn` | Alert content |
| `noftOcrnDt` | Timestamp |
| `lineNmLst` | Affected line(s) |
| `nonstopYn` | Non-stop flag |
| `xcseSitnBgngDt` | Incident start |
| `xcseSitnEndDt` | Incident end |

**Response Fields (Enhanced)**

| Field | Description |
|-------|-------------|
| `summary.delayedLines` | Lines with delays |
| `summary.suspendedLines` | Lines with service suspended |
| `summary.normalLines` | Lines operating normally |
| `alerts[].lineName` | Line name (Korean) |
| `alerts[].lineNameEn` | Line name (English) |
| `alerts[].status` | `normal`, `delayed`, or `suspended` |
| `alerts[].severity` | `low`, `medium`, or `high` |
| `alerts[].title` | Alert title |

**Example**
```bash
# Default format
curl "https://vercel-proxy-henna-eight.vercel.app/api/alerts"

# Enhanced format with status summary
curl "https://vercel-proxy-henna-eight.vercel.app/api/alerts?format=enhanced"
```

---

### 5. Last Train Time

**Endpoint**
```
GET /api/last-train/{station}?direction=up&weekType=1
```

**Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| station | Yes | Station name (Korean or English) |
| direction | No | `up`, `down`, or `all` (default: all) |
| weekType | No | `1`=Weekday, `2`=Saturday, `3`=Sunday/Holiday (default: auto) |

**Response Fields**

| Field | Description |
|-------|-------------|
| `station` | Station name (Korean) |
| `stationEn` | Station name (English) |
| `lastTrains[].direction` | Direction (Korean) |
| `lastTrains[].directionEn` | Direction (English) |
| `lastTrains[].time` | Last train time (HH:MM) |
| `lastTrains[].weekType` | Day type (Korean) |
| `lastTrains[].weekTypeEn` | Day type (English) |
| `lastTrains[].line` | Line name |
| `lastTrains[].destination` | Final destination |

**Example**
```bash
# Auto-detect day type
curl "https://vercel-proxy-henna-eight.vercel.app/api/last-train/홍대입구"

# English station name
curl "https://vercel-proxy-henna-eight.vercel.app/api/last-train/Hongdae"

# Specific direction and day
curl "https://vercel-proxy-henna-eight.vercel.app/api/last-train/강남?direction=up&weekType=1"
```

---

### 6. Exit Information

**Endpoint**
```
GET /api/exits/{station}
```

**Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| station | Yes | Station name (Korean or English) |

**Response Fields**

| Field | Description |
|-------|-------------|
| `station` | Station name (Korean) |
| `stationEn` | Station name (English) |
| `line` | Line name |
| `exits[].number` | Exit number |
| `exits[].landmark` | Nearby landmark (Korean) |
| `exits[].landmarkEn` | Nearby landmark (English) |
| `exits[].distance` | Walking distance |
| `exits[].facilities` | Facility types |

**Example**
```bash
# Get COEX exit info
curl "https://vercel-proxy-henna-eight.vercel.app/api/exits/삼성"

# English station name
curl "https://vercel-proxy-henna-eight.vercel.app/api/exits/Samsung"
```

---

## Landmark → Station Mapping

외국인 관광객이 자주 찾는 랜드마크와 해당 역 정보입니다.

| Landmark | Station | Line | Exit |
|----------|---------|------|------|
| COEX / 코엑스 | 삼성 Samsung | 2호선 | 5-6 |
| Lotte World / 롯데월드 | 잠실 Jamsil | 2호선 | 4 |
| Lotte World Tower | 잠실 Jamsil | 2호선 | 3 |
| Gyeongbokgung Palace / 경복궁 | 경복궁 Gyeongbokgung | 3호선 | 5 |
| Changdeokgung Palace / 창덕궁 | 안국 Anguk | 3호선 | 3 |
| DDP / 동대문디자인플라자 | 동대문역사문화공원 | 2호선 | 1 |
| Myeongdong / 명동 | 명동 Myeongdong | 4호선 | 6 |
| N Seoul Tower / 남산타워 | 명동 Myeongdong | 4호선 | 3 |
| Bukchon Hanok Village | 안국 Anguk | 3호선 | 6 |
| Insadong / 인사동 | 안국 Anguk | 3호선 | 1 |
| Hongdae / 홍대 | 홍대입구 Hongik Univ. | 2호선 | 9 |
| Itaewon / 이태원 | 이태원 Itaewon | 6호선 | 1 |
| Gangnam / 강남 | 강남 Gangnam | 2호선 | 10-11 |
| Yeouido Park / 여의도공원 | 여의도 Yeouido | 5호선 | 5 |
| IFC Mall | 여의도 Yeouido | 5호선 | 1 |
| 63 Building | 여의도 Yeouido | 5호선 | 3 |
| Gwanghwamun Square / 광화문광장 | 광화문 Gwanghwamun | 5호선 | 2 |
| Namdaemun Market / 남대문시장 | 서울역 Seoul Station | 1호선 | 10 |
| Cheonggyecheon Stream / 청계천 | 을지로입구 Euljiro 1-ga | 2호선 | 6 |
| Express Bus Terminal | 고속터미널 Express Terminal | 3호선 | 4,8 |
| Gimpo Airport | 김포공항 Gimpo Airport | 5호선 | 1,3 |
| Incheon Airport T1 | 인천공항1터미널 | 공항철도 | 1 |
| Incheon Airport T2 | 인천공항2터미널 | 공항철도 | 1 |

---

## Static Data (GitHub Raw)

For static data like station lists and line mappings, use GitHub raw URLs:

```bash
# Station list
curl "https://raw.githubusercontent.com/dukbong/seoul-subway/main/data/stations.json"

# Line ID mappings
curl "https://raw.githubusercontent.com/dukbong/seoul-subway/main/data/lines.json"

# Station name translations
curl "https://raw.githubusercontent.com/dukbong/seoul-subway/main/data/station-names.json"
```

---

## Line ID Mapping

| Line | ID | Line | ID |
|------|----|------|----|
| Line 1 | 1001 | Line 6 | 1006 |
| Line 2 | 1002 | Line 7 | 1007 |
| Line 3 | 1003 | Line 8 | 1008 |
| Line 4 | 1004 | Line 9 | 1009 |
| Line 5 | 1005 | Sinbundang | 1077 |
| Gyeongui-Jungang | 1063 | Gyeongchun | 1067 |
| Airport Railroad | 1065 | Suin-Bundang | 1075 |

---

## Station Name Mapping (English → Korean)

주요 역 이름의 영어-한글 매핑 테이블입니다. API 호출 시 영어 입력을 한글로 변환해야 합니다.

### Line 1 (1호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Seoul Station | 서울역 | City Hall | 시청 |
| Jonggak | 종각 | Jongno 3-ga | 종로3가 |
| Jongno 5-ga | 종로5가 | Dongdaemun | 동대문 |
| Cheongnyangni | 청량리 | Yongsan | 용산 |
| Noryangjin | 노량진 | Yeongdeungpo | 영등포 |
| Guro | 구로 | Incheon | 인천 |
| Bupyeong | 부평 | Suwon | 수원 |

### Line 2 (2호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Gangnam | 강남 | Yeoksam | 역삼 |
| Samseong | 삼성 | Jamsil | 잠실 |
| Sindorim | 신도림 | Hongdae (Hongik Univ.) | 홍대입구 |
| Hapjeong | 합정 | Dangsan | 당산 |
| Yeouido | 여의도 | Konkuk Univ. | 건대입구 |
| Seolleung | 선릉 | Samsung | 삼성 |
| Sports Complex | 종합운동장 | Gangbyeon | 강변 |
| Ttukseom | 뚝섬 | Seongsu | 성수 |
| Wangsimni | 왕십리 | Euljiro 3-ga | 을지로3가 |
| Euljiro 1-ga | 을지로입구 | City Hall | 시청 |
| Chungjeongno | 충정로 | Ewha Womans Univ. | 이대 |
| Sinchon | 신촌 | Sadang | 사당 |
| Nakseongdae | 낙성대 | Seoul Nat'l Univ. | 서울대입구 |
| Guro Digital Complex | 구로디지털단지 | Mullae | 문래 |

### Line 3 (3호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Gyeongbokgung | 경복궁 | Anguk | 안국 |
| Jongno 3-ga | 종로3가 | Chungmuro | 충무로 |
| Dongguk Univ. | 동대입구 | Yaksu | 약수 |
| Apgujeong | 압구정 | Sinsa | 신사 |
| Express Bus Terminal | 고속터미널 | Gyodae | 교대 |
| Nambu Bus Terminal | 남부터미널 | Yangjae | 양재 |
| Daehwa | 대화 | Juyeop | 주엽 |

### Line 4 (4호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Myeongdong | 명동 | Hoehyeon | 회현 |
| Seoul Station | 서울역 | Sookmyung Women's Univ. | 숙대입구 |
| Dongdaemun History & Culture Park | 동대문역사문화공원 | Hyehwa | 혜화 |
| Hansung Univ. | 한성대입구 | Mia | 미아 |
| Mia Sageori | 미아사거리 | Gireum | 길음 |
| Chongshin Univ. | 총신대입구 | Sadang | 사당 |

### Line 5 (5호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Gwanghwamun | 광화문 | Jongno 3-ga | 종로3가 |
| Dongdaemun History & Culture Park | 동대문역사문화공원 | Cheonggu | 청구 |
| Wangsimni | 왕십리 | Haengdang | 행당 |
| Yeouido | 여의도 | Yeouinaru | 여의나루 |
| Mapo | 마포 | Gongdeok | 공덕 |
| Gimpo Airport | 김포공항 | Banghwa | 방화 |

### Line 6 (6호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Itaewon | 이태원 | Samgakji | 삼각지 |
| Noksapyeong | 녹사평 | Hangang | 한강진 |
| Sangsu | 상수 | Hapjeong | 합정 |
| World Cup Stadium | 월드컵경기장 | Digital Media City | 디지털미디어시티 |

### Line 7 (7호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Gangnam-gu Office | 강남구청 | Cheongdam | 청담 |
| Konkuk Univ. | 건대입구 | Children's Grand Park | 어린이대공원 |
| Junggok | 중곡 | Ttukseom Resort | 뚝섬유원지 |
| Express Bus Terminal | 고속터미널 | Nonhyeon | 논현 |
| Hakdong | 학동 | Bogwang | 보광 |
| Jangam | 장암 | Dobongsan | 도봉산 |

### Line 8 (8호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Jamsil | 잠실 | Mongchontoseong | 몽촌토성 |
| Gangdong-gu Office | 강동구청 | Cheonho | 천호 |
| Bokjeong | 복정 | Sanseong | 산성 |
| Moran | 모란 | Amsa | 암사 |

### Line 9 (9호선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Sinnonhyeon | 신논현 | Express Bus Terminal | 고속터미널 |
| Dongjak | 동작 | Noryangjin | 노량진 |
| Yeouido | 여의도 | National Assembly | 국회의사당 |
| Dangsan | 당산 | Yeomchang | 염창 |
| Gimpo Airport | 김포공항 | Gaehwa | 개화 |
| Olympic Park | 올림픽공원 | Sports Complex | 종합운동장 |

### Sinbundang Line (신분당선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Gangnam | 강남 | Sinsa | 신사 |
| Yangjae | 양재 | Yangjae Citizen's Forest | 양재시민의숲 |
| Pangyo | 판교 | Jeongja | 정자 |
| Dongcheon | 동천 | Suji District Office | 수지구청 |
| Gwanggyo | 광교 | Gwanggyo Jungang | 광교중앙 |

### Gyeongui-Jungang Line (경의중앙선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Seoul Station | 서울역 | Hongdae (Hongik Univ.) | 홍대입구 |
| Gongdeok | 공덕 | Hyochang Park | 효창공원앞 |
| Yongsan | 용산 | Oksu | 옥수 |
| Wangsimni | 왕십리 | Cheongnyangni | 청량리 |
| DMC | 디지털미디어시티 | Susaek | 수색 |
| Ilsan | 일산 | Paju | 파주 |

### Airport Railroad (공항철도)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Seoul Station | 서울역 | Gongdeok | 공덕 |
| Hongdae (Hongik Univ.) | 홍대입구 | Digital Media City | 디지털미디어시티 |
| Gimpo Airport | 김포공항 | Incheon Airport T1 | 인천공항1터미널 |
| Incheon Airport T2 | 인천공항2터미널 | Cheongna Int'l City | 청라국제도시 |

### Suin-Bundang Line (수인분당선)
| English | Korean | English | Korean |
|---------|--------|---------|--------|
| Wangsimni | 왕십리 | Seolleung | 선릉 |
| Gangnam-gu Office | 강남구청 | Seonjeongneung | 선정릉 |
| Jeongja | 정자 | Migeum | 미금 |
| Ori | 오리 | Jukjeon | 죽전 |
| Suwon | 수원 | Incheon | 인천 |

---

## Usage Examples

**Real-time Arrival**
```bash
curl "https://vercel-proxy-henna-eight.vercel.app/api/realtime/강남"
```

**Station Search**
```bash
curl "https://vercel-proxy-henna-eight.vercel.app/api/stations?station=강남"
```

**Route Search**
```bash
curl "https://vercel-proxy-henna-eight.vercel.app/api/route?dptreStnNm=신도림&arvlStnNm=서울역"
```

**Service Alerts**
```bash
curl "https://vercel-proxy-henna-eight.vercel.app/api/alerts"
# Enhanced format with delay summary
curl "https://vercel-proxy-henna-eight.vercel.app/api/alerts?format=enhanced"
```

**Last Train**
```bash
# Korean station name
curl "https://vercel-proxy-henna-eight.vercel.app/api/last-train/홍대입구"
# English station name
curl "https://vercel-proxy-henna-eight.vercel.app/api/last-train/Gangnam"
```

**Exit Information**
```bash
# For COEX
curl "https://vercel-proxy-henna-eight.vercel.app/api/exits/삼성"
# For Lotte World
curl "https://vercel-proxy-henna-eight.vercel.app/api/exits/잠실"
```

---

## Line Color Mapping / 노선 색상 매핑

| Line / 호선 | Color / 색상 | Emoji |
|-------------|--------------|-------|
| 1호선 / Line 1 | Blue / 파랑 | 🔵 |
| 2호선 / Line 2 | Green / 초록 | 🟢 |
| 3호선 / Line 3 | Orange / 주황 | 🟠 |
| 4호선 / Line 4 | Sky Blue / 하늘 | 🔵 |
| 5호선 / Line 5 | Purple / 보라 | 🟣 |
| 6호선 / Line 6 | Brown / 갈색 | 🟤 |
| 7호선 / Line 7 | Olive / 올리브 | 🟢 |
| 8호선 / Line 8 | Pink / 분홍 | 🩷 |
| 9호선 / Line 9 | Gold / 금색 | 🟡 |
| 신분당선 / Sinbundang | Red / 빨강 | 🔴 |
| 경의중앙선 / Gyeongui-Jungang | Cyan / 청록 | 🔵 |
| 공항철도 / Airport Railroad | Blue / 파랑 | 🔵 |
| 수인분당선 / Suin-Bundang | Yellow / 노랑 | 🟡 |

---

## Output Format Guide

### Real-time Arrival

**Korean:**
```
[강남역 Gangnam]

| 호선 | 방향 | 도착 | 위치 | 유형 |
|------|------|------|------|------|
| 🟢 2 | 성수 (Seongsu) | 3분 | 역삼 | 일반 |
| 🟢 2 | 신촌 (Sinchon) | 5분 | 선정릉 | 일반 |
```

**English:**
```
[Gangnam Station 강남역]

| Line | Direction | Arrival | Location | Type |
|------|-----------|---------|----------|------|
| 🟢 2 | Seongsu (성수) | 3 min | Yeoksam | Regular |
| 🟢 2 | Sinchon (신촌) | 5 min | Seonjeongneung | Regular |
```

### Station Search

**Korean:**
```
[강남역]

| 호선 | 역코드 | 외부코드 |
|------|--------|----------|
| 2호선 | 222 | 0222 |
```

**English:**
```
[Gangnam Station]

| Line | Station Code | External Code |
|------|--------------|---------------|
| Line 2 | 222 | 0222 |
```

### Route Search

**Korean:**
```
[강남 → 홍대입구]

소요시간: 38분 | 거리: 22.1km | 요금: 1,650원 | 환승: 1회

🟢 강남 ─2호선─▶ 🟢 신도림 ─2호선─▶ 🟢 홍대입구

| 구분 | 역 | 호선 | 시간 |
|------|-----|------|------|
| 출발 | 강남 Gangnam | 🟢 2 | 09:03 |
| 환승 | 신도림 Sindorim | 🟢 2→2 | 09:18 |
| 도착 | 홍대입구 Hongdae | 🟢 2 | 09:42 |
```

**English:**
```
[Gangnam → Hongdae]

Time: 38 min | Distance: 22.1 km | Fare: 1,650 KRW | Transfer: 1

🟢 Gangnam ─Line 2─▶ 🟢 Sindorim ─Line 2─▶ 🟢 Hongdae

| Step | Station | Line | Time |
|------|---------|------|------|
| Depart | Gangnam 강남 | 🟢 2 | 09:03 |
| Transfer | Sindorim 신도림 | 🟢 2→2 | 09:18 |
| Arrive | Hongdae 홍대입구 | 🟢 2 | 09:42 |
```

### Service Alerts

**Korean:**
```
[운행 알림]

🔵 1호선 | 종로3가역 무정차 (15:00 ~ 15:22)
└─ 코레일 열차 연기 발생으로 인함

🟢 2호선 | 정상 운행
```

**English:**
```
[Service Alerts]

🔵 Line 1 | Jongno 3-ga Non-stop (15:00 ~ 15:22)
└─ Due to smoke from Korail train

🟢 Line 2 | Normal operation
```

### Last Train

**Korean:**
```
[홍대입구 막차 시간]

| 방향 | 시간 | 종착역 | 요일 |
|------|------|--------|------|
| 🟢 내선순환 | 00:32 | 성수 | 평일 |
| 🟢 외선순환 | 00:25 | 신도림 | 평일 |
```

**English:**
```
[Last Train - Hongik Univ.]

| Direction | Time | Destination | Day |
|-----------|------|-------------|-----|
| 🟢 Inner Circle | 00:32 | Seongsu | Weekday |
| 🟢 Outer Circle | 00:25 | Sindorim | Weekday |
```

### Exit Info

**Korean:**
```
[삼성역 출구 정보]

| 출구 | 시설 | 거리 |
|------|------|------|
| 5번 | 코엑스몰 | 도보 3분 |
| 6번 | 코엑스 아쿠아리움 | 도보 5분 |
| 7번 | 봉은사 | 도보 10분 |
```

**English:**
```
[Samsung Station Exits]

| Exit | Landmark | Distance |
|------|----------|----------|
| #5 | COEX Mall | 3 min walk |
| #6 | COEX Aquarium | 5 min walk |
| #7 | Bongeunsa Temple | 10 min walk |
```

### Error

**Korean:**
```
오류: 역을 찾을 수 없습니다.
"강남" (역 이름만)으로 검색해 보세요.
```

**English:**
```
Error: Station not found.
Try searching with "Gangnam" (station name only).
```
