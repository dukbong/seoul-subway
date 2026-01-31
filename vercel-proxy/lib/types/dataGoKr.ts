/** 경로 구간 정보 */
export interface PathSegment {
  idx: number;
  stnNm: string; // 역명
  lnCd: string; // 노선코드
  lnNm: string; // 노선명
  travelTm?: number; // 소요시간(분)
  transferYn?: string; // 환승여부 (Y/N)
}

/** 경로 탐색 API 응답 (getShtrmPath) */
export interface RouteApiResponse {
  result?: {
    globalTravelTime: number;
    globalStationCount: number;
    fare: number;
    path: PathSegment[];
  };
}

/** 공지사항 정보 */
export interface Notice {
  ntceNo: string; // 공지번호
  ntceSj: string; // 제목
  ntceCn?: string; // 내용
  lineNm?: string; // 노선명
  regDt: string; // 등록일
}

/** 공지사항 API 응답 (getNtceList) */
export interface AlertsApiResponse {
  ntceList?: Notice[];
}
