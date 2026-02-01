/** 역 정보 (경로 검색용) */
export interface RouteStation {
  stnCd: string;
  stnNo: string;
  stnNm: string;
  lineNm: string;
  brlnNm?: string | null;
}

/** 경로 구간 정보 (실제 API 응답) */
export interface RoutePath {
  dptreStn: RouteStation;
  arvlStn: RouteStation;
  stnSctnDstc: number; // 구간 거리 (미터)
  reqHr: number; // 소요시간 (초)
  wtngHr: number; // 대기시간 (초)
  tmnlStnNm: string; // 종착역
  tmnlStnCd: string;
  upbdnbSe: string; // 상하행 (내선/외선)
  trainno: string;
  trainDptreTm: string;
  trainArvlTm: string;
  trsitYn: string; // 환승 여부 (Y/N)
  etrnYn: string;
  nonstopYn: string;
}

/** 경로 탐색 API 응답 (getShtrmPath) - 실제 API 구조 */
export interface RouteApiResponse {
  header?: {
    resultCode: string;
    resultMsg: string;
  };
  body?: {
    searchType: string;
    totalDstc: number; // 총 거리 (미터)
    totalreqHr: number; // 총 소요시간 (초)
    totalCardCrg: number; // 요금
    trsitNmtm: number;
    trfstnNms: string[];
    exclTrfstnNms: string[];
    thrghStnNms: string[];
    schInclYn: string;
    paths: RoutePath[];
  };
}

/** 경로 구간 정보 (레거시 - 테스트용) */
export interface PathSegment {
  idx: number;
  stnNm: string;
  lnCd: string;
  lnNm: string;
  travelTm?: number;
  transferYn?: string;
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
