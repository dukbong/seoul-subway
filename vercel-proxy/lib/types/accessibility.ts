/**
 * Seoul Open API (openapi.seoul.go.kr) 접근성 정보 타입 정의
 * 실제 API 응답 구조에 맞춤
 */

/** 공통 API 응답 wrapper */
export interface SeoulOpenApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[];
      };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

/** 엘리베이터 위치 정보 (getFcElvtr) - 실제 API 필드 */
export interface ElevatorLocationInfo {
  fcltNo: string;        // 시설번호
  fcltNm: string;        // 시설명
  lineNm: string;        // 호선명 (예: "2호선")
  stnCd: string;         // 역코드
  stnNm: string;         // 역명
  stnNo: string;         // 역번호
  mngNo: string;         // 관리번호
  vcntEntrcNo: string;   // 출입구번호
  dtlPstn: string;       // 상세위치
  bgngFlrGrndUdgdSe: string; // 시작층 지상/지하
  bgngFlr: string;       // 시작층
  endFlrGrndUdgdSe: string;  // 종료층 지상/지하
  endFlr: string;        // 종료층
  pscpNope: number;      // 정원
  pscpWht: string;       // 적재중량
  oprtngSitu: string;    // 운영상황 (M: 정상)
  elvtrSn: string;       // 엘리베이터 일련번호
  crtrYmd?: string;      // 생성일
}

/** 에스컬레이터 위치 정보 (getFcEsctr) */
export interface EscalatorLocationInfo {
  fcltNo: string;
  fcltNm: string;
  lineNm: string;
  stnCd: string;
  stnNm: string;
  stnNo: string;
  mngNo: string;
  vcntEntrcNo: string;
  dtlPstn: string;
  bgngFlrGrndUdgdSe: string;
  bgngFlr: string;
  endFlrGrndUdgdSe: string;
  endFlr: string;
  oprtngSitu: string;
  esctrSn: string;
  crtrYmd?: string;
}

/** 휠체어리프트 정보 */
export interface WheelchairLiftInfo {
  fcltNo: string;
  fcltNm: string;
  lineNm: string;
  stnCd: string;
  stnNm: string;
  stnNo: string;
  mngNo: string;
  dtlPstn: string;
  oprtngSitu: string;
  crtrYmd?: string;
}

/** 빠른하차 정보 (getFstExit) */
export interface QuickExitInfo {
  lineNm: string;        // 호선명
  stnNm: string;         // 역명
  updnLine: string;      // 상하행 구분
  drtn: string;          // 방향
  exitNo: string;        // 출구번호
  stairNo: string;       // 계단번호
  elvtrNo: string;       // 엘리베이터 번호
  esctrNo: string;       // 에스컬레이터 번호
  fstCarNo: string;      // 빠른하차 칸 번호
  fstDoorNo?: string;    // 빠른하차 문 번호
  remark?: string;
}

/** 화장실 위치 정보 (getFcRstrm) */
export interface RestroomInfo {
  fcltNo: string;
  fcltNm: string;
  lineNm: string;
  stnCd: string;
  stnNm: string;
  stnNo: string;
  dtlPstn: string;           // 상세위치
  grndUdgdSe: string;        // 지상/지하 구분
  flr: string;               // 층
  gateInotrSe: string;       // 개찰구 내외 (내부/외부)
  mlsexToiletInnb?: number;  // 남성용 대변기 수
  mlsexUrinInnb?: number;    // 남성용 소변기 수
  wmsexToiletInnb?: number;  // 여성용 대변기 수
  dspsnToiletInnb?: number;  // 장애인 화장실 수
  babyChngSttus?: string;    // 기저귀 교환대 유무
  rstrmInfo?: string;        // 화장실 유형 정보 (예: "일반(남,여) / 교통약자(남,여)")
  whlchrAcsPsbltyYn?: string; // 휠체어 접근 가능 여부 (Y/N)
  crtrYmd?: string;
}

/** API 응답 타입 aliases */
export type ElevatorLocationApiResponse = SeoulOpenApiResponse<ElevatorLocationInfo>;
export type EscalatorLocationApiResponse = SeoulOpenApiResponse<EscalatorLocationInfo>;
export type WheelchairLiftApiResponse = SeoulOpenApiResponse<WheelchairLiftInfo>;
export type QuickExitApiResponse = SeoulOpenApiResponse<QuickExitInfo>;
export type RestroomApiResponse = SeoulOpenApiResponse<RestroomInfo>;

// 운영 정보는 별도 API가 없음 - 위치 정보의 oprtngSitu 필드 사용
export type ElevatorOperationInfo = ElevatorLocationInfo;
export type EscalatorOperationInfo = EscalatorLocationInfo;
export type ElevatorOperationApiResponse = ElevatorLocationApiResponse;
export type EscalatorOperationApiResponse = EscalatorLocationApiResponse;

/** 통합 접근성 정보 (응답용) */
export interface AccessibilityInfo {
  station: string;
  stationEn?: string;
  elevators: ElevatorLocationInfo[];
  escalators: EscalatorLocationInfo[];
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
