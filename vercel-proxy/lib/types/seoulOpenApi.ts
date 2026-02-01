import type { SeoulApiResult } from './common.js';

/** 역 정보 (SearchInfoBySubwayNameService) */
export interface StationInfo {
  STATION_CD: string; // 역 코드
  STATION_NM: string; // 역명
  LINE_NUM: string; // 호선 (예: "02호선")
  FR_CODE: string; // 외부코드
  CYBER_ST_CODE: string; // 사이버스테이션 코드
  XPOINT?: string; // X좌표
  YPOINT?: string; // Y좌표
}

/** 역 검색 API 응답 */
export interface StationsApiResponse {
  SearchInfoBySubwayNameService?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: StationInfo[];
  };
}

/** 실시간 도착 정보 */
export interface RealtimeArrival {
  rowNum: number;
  subwayId: string;
  subwayNm?: string;
  updnLine: string; // 상행/하행
  trainLineNm: string; // 도착지방면
  statnNm: string; // 역명
  btrainNo: string; // 열차번호
  bstatnNm: string; // 종착역명
  arvlMsg2: string; // 도착 메시지 (예: "3분 후 도착")
  arvlMsg3: string; // 도착역명
  arvlCd: string; // 도착코드
  recptnDt?: string; // 수신 시간
  ordkey?: string; // 순서 키
  subwayList?: string;
  statnFid?: string;
  statnTid?: string;
  statnId?: string;
  trainSttus?: string;
  isFastTrain?: string;
  bstatnId?: string;
  barvlDt?: string;
  arvlMsec?: string;
  trnsitCo?: string;
}

/** 실시간 도착 API 에러 메시지 */
export interface RealtimeApiError {
  status: number;
  code: string;
  message: string;
}

/** 실시간 도착 API 응답 */
export interface RealtimeApiResponse {
  errorMessage?: RealtimeApiError;
  realtimeArrivalList?: RealtimeArrival[];
}

/** 막차 시간표 정보 (SearchLastTrainTimeOfLine) */
export interface LastTrainInfo {
  STATION_CD: string; // 역코드
  STATION_NM: string; // 역명
  LINE_NUM: string; // 호선 (예: "02호선")
  WEEK_TAG: string; // 요일 (1=평일, 2=토요일, 3=일요일/공휴일)
  INOUT_TAG: string; // 상하행 (1=상행/내선, 2=하행/외선)
  FR_CODE: string; // 외부코드
  LAST_TIME: string; // 막차시간 (HHMMSS)
  LAST_STATION: string; // 막차 종착역명
}

/** 막차 시간표 API 응답 */
export interface LastTrainApiResponse {
  SearchLastTrainTimeOfLine?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: LastTrainInfo[];
  };
}
