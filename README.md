# seoul-subway

Seoul Subway information skill for Claude. **No API key required!**

서울 지하철 정보 스킬입니다. **API 키가 필요 없습니다!**

## Features / 기능

- **Real-time Arrival / 실시간 도착정보** - Train arrival times by station
- **Station Search / 역 검색** - Line and station code lookup
- **Route Search / 경로 검색** - Shortest path, travel time, fare
- **Service Alerts / 운행 알림** - Delays, incidents, express stops
- **Last Train / 막차 시간** - Last train times for 28 major stations (static data)
- **Exit Info / 출구 정보** - Exit information for 29 major tourist stations (static data)
- **Accessibility / 접근성 정보** - Elevators, escalators, wheelchair lifts
- **Quick Exit / 빠른하차** - Best car for facilities
- **Restrooms / 화장실** - Restroom locations

## Usage / 사용법

```
"강남역 도착정보" / "Gangnam station arrivals"
"강남역 몇호선?" / "What line is Gangnam?"
"신도림에서 서울역" / "Sindorim to Seoul Station"
"지하철 지연 있어?" / "Any subway delays?"
"홍대 막차 몇 시야?" / "Last train to Hongdae?"
"코엑스 몇 번 출구?" / "Which exit for COEX?"
"강남역 엘리베이터" / "Gangnam elevators"
"강남역 빠른하차" / "Gangnam quick exit"
"강남역 화장실" / "Gangnam restrooms"
```

## First Time Setup / 첫 사용 안내

When prompted for proxy domain access, select:

프록시 도메인 접근 확인 창이 뜨면 선택:

**`Yes, and don't ask again for vercel-proxy-henna-eight.vercel.app`**

---

## Architecture / 아키텍처

This skill uses a proxy server architecture so users don't need to obtain API keys.

이 스킬은 프록시 서버 아키텍처를 사용하여 사용자가 API 키를 발급받을 필요가 없습니다.

```
User (Skill)
     │
     ├── Static Data ──→ GitHub Raw (free)
     │                   /data/stations.json
     │                   /data/lines.json
     │                   /data/station-names.json
     │
     └── Dynamic Data ──→ Vercel Proxy (free)
                          /api/realtime/[station]
                          /api/route
                          /api/alerts
                          /api/stations
                          /api/last-train/[station]   (static data)
                          /api/exits/[station]        (static data)
                          /api/accessibility/[station]
                          /api/quick-exit/[station]
                          /api/restrooms/[station]
```

### Proxy Endpoints

| Feature | Endpoint |
|---------|----------|
| Real-time Arrival | `GET /api/realtime/{station}` |
| Station Search | `GET /api/stations?station={name}` |
| Route Search | `GET /api/route?dptreStnNm=...&arvlStnNm=...` |
| Service Alerts | `GET /api/alerts` |
| Last Train | `GET /api/last-train/{station}` |
| Exit Info | `GET /api/exits/{station}` |
| Accessibility | `GET /api/accessibility/{station}` |
| Quick Exit | `GET /api/quick-exit/{station}` |
| Restrooms | `GET /api/restrooms/{station}` |

See [SKILL.md](./SKILL.md) for full API documentation.

---

## For Developers / 개발자용

If you want to deploy your own proxy server:

자체 프록시 서버를 배포하려면:

### 1. Get API Keys / API 키 발급

#### SEOUL_OPENAPI_KEY

> Provider: Seoul Open Data Plaza (서울 열린데이터 광장)

1. Go to [API Key Request Page](https://data.seoul.go.kr/together/mypage/actkeyMain.do)
2. Sign up and request **실시간 지하철 인증키** (Real-time Subway API Key)
3. Wait 5-30 minutes for activation

#### DATA_GO_KR_KEY

> Provider: Public Data Portal (공공데이터포털)

1. Go to [data.go.kr](https://www.data.go.kr)
2. Request access to these APIs:
   - [서울교통공사_지하철알림정보](https://www.data.go.kr/data/15144070/openapi.do)
   - [서울교통공사_최단경로이동정보](https://www.data.go.kr/data/15143842/openapi.do)
3. Copy the **일반 인증키 (Encoding)** from your dashboard

### 2. Deploy Proxy Server / 프록시 서버 배포

```bash
cd vercel-proxy
npm install -g vercel
vercel
```

Set environment variables in Vercel Dashboard:
- `SEOUL_OPENAPI_KEY`
- `DATA_GO_KR_KEY`

See [vercel-proxy/README.md](./vercel-proxy/README.md) for detailed instructions.

### 3. Collect Station Data / 역 데이터 수집

```bash
export SEOUL_OPENAPI_KEY="your-key"
./scripts/collect-stations.sh
```

This populates `data/stations.json` with all Seoul subway stations.

---

## Project Structure / 프로젝트 구조

```
seoul-subway/
├── SKILL.md              # Skill definition and API docs
├── README.md             # This file
├── data/
│   ├── stations.json     # Station list (run collect script)
│   ├── lines.json        # Line ID mappings
│   └── station-names.json # English-Korean translations
├── scripts/
│   └── collect-stations.sh # Station data collection script
└── vercel-proxy/
    ├── api/
    │   ├── realtime/[station].ts
    │   ├── route.ts
    │   ├── alerts.ts
    │   ├── stations.ts
    │   ├── last-train/[station].ts
    │   ├── exits/[station].ts
    │   ├── accessibility/[station].ts
    │   ├── quick-exit/[station].ts
    │   └── restrooms/[station].ts
    ├── package.json
    ├── vercel.json
    └── README.md         # Deployment guide
```

---

## License

MIT
