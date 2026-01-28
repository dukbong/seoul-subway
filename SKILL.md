---
name: seoul-subway
description: 서울 지하철 실시간 도착정보, 경로검색, 운행 알림 (Seoul Metro real-time info)
metadata: {"moltbot":{"emoji":"🚇","requires":{"bins":["curl","jq"]},"config":{"requiredEnv":["SEOUL_OPENAPI_KEY","DATA_GO_KR_KEY"]}}}
homepage: https://github.com/hyeonsung/seoul-subway
user-invocable: true
---

# 서울 지하철 스킬

서울 지하철 실시간 정보를 조회합니다.

## 기능

### 1. 실시간 도착정보
역 이름으로 열차 도착 예정 시간을 조회합니다.

**트리거 예시:**
- "강남역 도착정보"
- "홍대입구역 언제 와?"
- "신도림 지하철 도착"

**API:** `http://swopenAPI.seoul.go.kr/api/subway/{SEOUL_OPENAPI_KEY}/json/realtimeStationArrival/{startIndex}/{endIndex}/{역이름}`

**응답 필드:**
- `subwayId`: 호선 ID (1002=2호선, 1077=신분당선 등)
- `trainLineNm`: 열차 운행 방향 (예: "성수행 - 역삼방면")
- `arvlMsg2`: 도착 예정 메시지 (예: "4분 20초 후")
- `arvlMsg3`: 현재 위치 (예: "방배")
- `btrainSttus`: 열차 상태 (일반/급행)
- `lstcarAt`: 막차 여부 (0: 아님, 1: 막차)

### 2. 역명 검색
역 이름으로 호선, 역코드 등 기본 정보를 조회합니다.

**트리거 예시:**
- "강남역 정보"
- "강남역 몇호선?"
- "신도림역 검색"

**API:** `http://openapi.seoul.go.kr:8088/{SEOUL_OPENAPI_KEY}/json/SearchInfoBySubwayNameService/{startIndex}/{endIndex}/{역이름}`

**응답 필드:**
- `STATION_CD`: 역 코드
- `STATION_NM`: 역 이름
- `LINE_NUM`: 호선 이름 (예: "02호선", "신분당선")
- `FR_CODE`: 외부 역 코드

### 3. 최단경로 검색
출발역에서 도착역까지 최단 경로를 검색합니다.

**트리거 예시:**
- "신도림에서 서울역"
- "강남에서 홍대까지"
- "잠실역에서 여의도역 어떻게 가?"

**API:** `https://apis.data.go.kr/B553766/path/getShtrmPath`

**필수 파라미터:**
- `serviceKey`: DATA_GO_KR_KEY
- `dptreStnNm`: 출발역명
- `arvlStnNm`: 도착역명
- `searchDt`: 검색일시 (yyyy-MM-dd HH:mm:ss) - **필수**
- `dataType`: JSON

**선택 파라미터:**
- `searchType`: duration(최소시간), distance(최단거리), transfer(최소환승)
- `exclTrfstnNms`: 제외 환승역명 (콤마 구분)
- `thrghStnNms`: 경유역명 (콤마 구분)
- `schInclYn`: 열차시간표 포함 여부 (기본: Y)

**응답 필드:**
- `totalDstc`: 총 거리 (m)
- `totalreqHr`: 총 소요시간 (초)
- `totalCardCrg`: 요금 (원)
- `paths[]`: 구간별 상세 정보
  - `dptreStn`, `arvlStn`: 출발/도착역 정보
  - `trainno`: 열차번호
  - `trainDptreTm`, `trainArvlTm`: 출발/도착 시간
  - `trsitYn`: 환승 여부

### 4. 운행 알림
지하철 지연, 사고, 무정차 등 이례상황을 조회합니다.

**트리거 예시:**
- "지하철 지연 있어?"
- "오늘 지하철 상황"
- "지하철 운행 알림"

**API:** `https://apis.data.go.kr/B553766/ntce/getNtceList`

**파라미터:**
- `serviceKey`: DATA_GO_KR_KEY
- `dataType`: JSON
- `pageNo`: 페이지 번호
- `numOfRows`: 페이지당 결과 수
- `lineNm`: 호선명 (선택)

**응답 필드:**
- `noftTtl`: 알림 제목
- `noftCn`: 알림 내용
- `noftOcrnDt`: 알림 발생 일시
- `lineNmLst`: 해당 호선
- `noftSeCd`: 알림 구분 코드
- `nonstopYn`: 무정차 여부
- `upbdnbSe`: 상행/하행
- `xcseSitnBgngDt`, `xcseSitnEndDt`: 이례상황 시작/종료 일시

## 환경변수

| 변수명 | 용도 | 발급처 |
|--------|------|--------|
| `SEOUL_OPENAPI_KEY` | 도착정보, 역검색 | data.seoul.go.kr |
| `DATA_GO_KR_KEY` | 경로검색, 알림정보 | data.go.kr |

## 호선 ID 매핑

| 호선 | subwayId |
|------|----------|
| 1호선 | 1001 |
| 2호선 | 1002 |
| 3호선 | 1003 |
| 4호선 | 1004 |
| 5호선 | 1005 |
| 6호선 | 1006 |
| 7호선 | 1007 |
| 8호선 | 1008 |
| 9호선 | 1009 |
| 신분당선 | 1077 |
| 경의중앙선 | 1063 |
| 공항철도 | 1065 |
| 경춘선 | 1067 |
| 수인분당선 | 1075 |

## 사용 예시

### 도착정보 조회
```bash
curl "http://swopenAPI.seoul.go.kr/api/subway/${SEOUL_OPENAPI_KEY}/json/realtimeStationArrival/0/10/강남"
```

### 역명 검색
```bash
curl "http://openapi.seoul.go.kr:8088/${SEOUL_OPENAPI_KEY}/json/SearchInfoBySubwayNameService/1/10/강남"
```

### 최단경로 검색
```bash
# 한글 파라미터는 --data-urlencode로 인코딩 필수
curl -G "https://apis.data.go.kr/B553766/path/getShtrmPath?serviceKey=${DATA_GO_KR_KEY}&dataType=JSON" \
  --data-urlencode "dptreStnNm=신도림" \
  --data-urlencode "arvlStnNm=서울역" \
  --data-urlencode "searchDt=$(date '+%Y-%m-%d %H:%M:%S')"
```

### 운행 알림 조회
```bash
curl "https://apis.data.go.kr/B553766/ntce/getNtceList?serviceKey=${DATA_GO_KR_KEY}&dataType=JSON&pageNo=1&numOfRows=10"
```

## 출력 형식 가이드

사용자에게 응답할 때 아래 형식을 따르세요.

### 1. 실시간 도착정보

```
🚇 강남역 도착정보

| 호선 | 방향 | 도착 | 현재위치 | 열차 |
|------|------|------|----------|------|
| 2호선 | 성수행 | 3분 후 | 역삼 | 일반 |
| 2호선 | 신도림행 | 5분 후 | 교대 | 급행 |
| 신분당선 | 광교행 | 2분 후 | 양재시민의숲 | 일반 |

💡 막차 정보가 있으면 "🌙 막차" 표시를 추가하세요.
```

### 2. 역명 검색

```
📍 강남역

| 호선 | 역코드 | 외부코드 |
|------|--------|----------|
| 2호선 | 222 | 0222 |
| 신분당선 | D7 | D07 |
```

### 3. 최단경로 검색

```
🚇 강남 → 홍대입구

⏱ 38분 | 📏 22.1km | 💰 1,650원 | 🔄 환승 1회

**경로:**
1. 09:03 **강남** 출발 (2호선 성수행)
2. 09:18 **신도림** 환승 (2호선 → 1호선)
3. 09:42 **홍대입구** 도착

💡 열차시간표가 있으면 구체적인 시간을 포함하세요.
```

### 4. 운행 알림

```
⚠️ 지하철 운행 알림

**[1호선]** 종로3가역 무정차 통과
📅 15:00 ~ 15:22
📝 코레일 열차 연기발생으로 인한 조치

---

**[2호선]** 정상 운행 중

💡 알림이 없으면 "✅ 현재 모든 노선 정상 운행 중입니다."로 응답하세요.
```

### 오류 응답

```
❌ 역명을 찾을 수 없습니다.
"강남"으로 다시 검색해 보세요. (역 이름만 입력)
```
