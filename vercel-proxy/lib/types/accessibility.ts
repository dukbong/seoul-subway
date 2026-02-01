import type { SeoulApiResult } from './common.js';

/** 엘리베이터 위치 정보 (getFcElvtr) */
export interface ElevatorLocationInfo {
  SBWAY_STTN_CD: string; // 역코드
  SBWAY_STTN_NM: string; // 역명
  SW_NM: string; // 호선명
  ELVTR_SE: string; // 엘리베이터 구분
  INSTL_PLACE: string; // 설치 위치
  INSTL_LT: string; // 설치층
  GROUND_CD: string; // 지상/지하 구분 (1: 지상, 2: 지하)
  ELVTR_NO?: string; // 엘리베이터 번호
  OPTN_DC?: string; // 운영 설명
}

/** 엘리베이터 위치 API 응답 */
export interface ElevatorLocationApiResponse {
  getFcElvtr?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: ElevatorLocationInfo[];
  };
}

/** 에스컬레이터 위치 정보 (getFcEsctr) */
export interface EscalatorLocationInfo {
  SBWAY_STTN_CD: string; // 역코드
  SBWAY_STTN_NM: string; // 역명
  SW_NM: string; // 호선명
  ESCTR_SE: string; // 에스컬레이터 구분
  INSTL_PLACE: string; // 설치 위치
  INSTL_LT: string; // 설치층
  GROUND_CD: string; // 지상/지하 구분
  ESCTR_NO?: string; // 에스컬레이터 번호
  OPTN_DC?: string; // 운영 설명
}

/** 에스컬레이터 위치 API 응답 */
export interface EscalatorLocationApiResponse {
  getFcEsctr?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: EscalatorLocationInfo[];
  };
}

/** 엘리베이터 운영 정보 (getWksnElvtr) */
export interface ElevatorOperationInfo {
  SBWAY_STTN_CD: string; // 역코드
  SBWAY_STTN_NM: string; // 역명
  SW_NM: string; // 호선명
  ELVTR_NO: string; // 엘리베이터 번호
  INSTL_PLACE: string; // 설치 위치
  OPER_STTUS: string; // 운영 상태 (정상, 고장 등)
  OPER_DE?: string; // 운영 일자
  OPER_BGNG_TM?: string; // 운영 시작 시간
  OPER_END_TM?: string; // 운영 종료 시간
}

/** 엘리베이터 운영 API 응답 */
export interface ElevatorOperationApiResponse {
  getWksnElvtr?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: ElevatorOperationInfo[];
  };
}

/** 에스컬레이터 운영 정보 (getWksnEsctr) */
export interface EscalatorOperationInfo {
  SBWAY_STTN_CD: string; // 역코드
  SBWAY_STTN_NM: string; // 역명
  SW_NM: string; // 호선명
  ESCTR_NO: string; // 에스컬레이터 번호
  INSTL_PLACE: string; // 설치 위치
  OPER_STTUS: string; // 운영 상태
  OPER_DE?: string; // 운영 일자
  OPER_BGNG_TM?: string; // 운영 시작 시간
  OPER_END_TM?: string; // 운영 종료 시간
}

/** 에스컬레이터 운영 API 응답 */
export interface EscalatorOperationApiResponse {
  getWksnEsctr?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: EscalatorOperationInfo[];
  };
}

/** 휠체어리프트 정보 (getWksnWhcllift) */
export interface WheelchairLiftInfo {
  SBWAY_STTN_CD: string; // 역코드
  SBWAY_STTN_NM: string; // 역명
  SW_NM: string; // 호선명
  WHCLLIFT_NO: string; // 휠체어리프트 번호
  INSTL_PLACE: string; // 설치 위치
  OPER_STTUS: string; // 운영 상태
  OPER_DE?: string; // 운영 일자
  OPER_BGNG_TM?: string; // 운영 시작 시간
  OPER_END_TM?: string; // 운영 종료 시간
}

/** 휠체어리프트 API 응답 */
export interface WheelchairLiftApiResponse {
  getWksnWhcllift?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: WheelchairLiftInfo[];
  };
}

/** 빠른하차 정보 (getFstExit) */
export interface QuickExitInfo {
  SBWAY_STTN_CD: string; // 역코드
  SBWAY_STTN_NM: string; // 역명
  SW_NM: string; // 호선명
  UPDNLN_SE: string; // 상하행 구분
  DRTN: string; // 방향
  EXIT_NO: string; // 출구번호
  STAIR_NO: string; // 계단번호
  ELVTR_NO: string; // 엘리베이터 번호
  ESCTR_NO: string; // 에스컬레이터 번호
  FST_CAR_NO: string; // 빠른하차 칸 번호
  FST_DOOR_NO?: string; // 빠른하차 문 번호
  REMARK?: string; // 비고
}

/** 빠른하차 API 응답 */
export interface QuickExitApiResponse {
  getFstExit?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: QuickExitInfo[];
  };
}

/** 화장실 위치 정보 (getFcRstrm) */
export interface RestroomInfo {
  SBWAY_STTN_CD: string; // 역코드
  SBWAY_STTN_NM: string; // 역명
  SW_NM: string; // 호선명
  RSTRM_SE: string; // 화장실 구분
  INSTL_PLACE: string; // 설치 위치
  INSTL_LT: string; // 설치층
  GROUND_CD: string; // 지상/지하 구분
  GATE_INOTR_SE: string; // 개찰구 내외부 구분
  MLSEX_TOILET_INNB?: string; // 남성용 대변기 수
  MLSEX_URIN_INNB?: string; // 남성용 소변기 수
  WMSEX_TOILET_INNB?: string; // 여성용 대변기 수
  DSPSN_TOILET_INNB?: string; // 장애인 화장실 수
  BABY_CHNG_STTUS?: string; // 기저귀 교환대 유무
}

/** 화장실 API 응답 */
export interface RestroomApiResponse {
  getFcRstrm?: {
    list_total_count: number;
    RESULT: SeoulApiResult;
    row: RestroomInfo[];
  };
}

/** 통합 접근성 정보 (응답용) */
export interface AccessibilityInfo {
  station: string;
  stationEn?: string;
  elevators: {
    locations: ElevatorLocationInfo[];
    operations: ElevatorOperationInfo[];
  };
  escalators: {
    locations: EscalatorLocationInfo[];
    operations: EscalatorOperationInfo[];
  };
  wheelchairLifts: WheelchairLiftInfo[];
}

/** 통합 빠른하차 정보 (응답용) */
export interface QuickExitData {
  station: string;
  stationEn?: string;
  quickExits: QuickExitInfo[];
}

/** 통합 화장실 정보 (응답용) */
export interface RestroomData {
  station: string;
  stationEn?: string;
  restrooms: RestroomInfo[];
}
