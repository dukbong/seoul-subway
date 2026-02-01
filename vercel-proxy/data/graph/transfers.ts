/**
 * 환승역 데이터
 * 동일 역명에서 서로 다른 노선 간 환승 정보
 */
import type { TransferGroup } from '../../lib/types/graph.js';
import { createStationId } from './stations.js';

/** 기본 환승 시간 (초) */
const DEFAULT_WALK_TIME = 180; // 3분

/** 긴 환승 시간 (초) - 긴 환승 통로 */
const LONG_WALK_TIME = 300; // 5분

/** 매우 긴 환승 시간 (초) */
const VERY_LONG_WALK_TIME = 420; // 7분

/**
 * 환승역 그룹 데이터
 * 각 환승역에서 연결되는 노선들과 환승 소요 시간
 */
export const transfers: TransferGroup[] = [
  // 1호선 환승역
  {
    name: '서울역',
    stations: [createStationId('1', '133'), createStationId('4', '429')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '시청',
    stations: [createStationId('1', '132'), createStationId('2', '201')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '종로3가',
    stations: [
      createStationId('1', '130'),
      createStationId('3', '329'),
      createStationId('5', '534'),
    ],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '동대문',
    stations: [createStationId('1', '128'), createStationId('4', '424')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '신설동',
    stations: [createStationId('1', '126'), createStationId('2', '211-4')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '동묘앞',
    stations: [createStationId('1', '127'), createStationId('6', '610-21')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '청량리',
    stations: [createStationId('1', '124')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '회기',
    stations: [createStationId('1', '123')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '석계',
    stations: [createStationId('1', '120'), createStationId('6', '610-29')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '창동',
    stations: [createStationId('1', '116'), createStationId('4', '415')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '도봉산',
    stations: [createStationId('1', '113'), createStationId('7', '710')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '노량진',
    stations: [createStationId('1', '136'), createStationId('9', '917')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '신도림',
    stations: [createStationId('1', '140'), createStationId('2', '234')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '구로',
    stations: [createStationId('1', '141')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '온수',
    stations: [createStationId('1', '145'), createStationId('7', '750')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '부평',
    stations: [createStationId('1', '152')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '금정',
    stations: [createStationId('1', 'P148'), createStationId('4', '446')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '가산디지털단지',
    stations: [createStationId('1', 'P141'), createStationId('7', '746')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 2호선 환승역
  {
    name: '을지로3가',
    stations: [createStationId('2', '203'), createStationId('3', '330')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '을지로4가',
    stations: [createStationId('2', '204'), createStationId('5', '535')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '동대문역사문화공원',
    stations: [
      createStationId('2', '205'),
      createStationId('4', '425'),
      createStationId('5', '536'),
    ],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '신당',
    stations: [createStationId('2', '206'), createStationId('6', '610-20')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '왕십리',
    stations: [createStationId('2', '208'), createStationId('5', '540')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '성수',
    stations: [createStationId('2', '211')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '건대입구',
    stations: [createStationId('2', '212'), createStationId('7', '727')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '잠실',
    stations: [createStationId('2', '216'), createStationId('8', '820')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '종합운동장',
    stations: [createStationId('2', '218'), createStationId('9', '930')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '선릉',
    stations: [createStationId('2', '220')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '강남',
    stations: [createStationId('2', '222')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '교대',
    stations: [createStationId('2', '223'), createStationId('3', '340')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '사당',
    stations: [createStationId('2', '226'), createStationId('4', '436')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '신림',
    stations: [createStationId('2', '230')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '대림',
    stations: [createStationId('2', '233'), createStationId('7', '744')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '영등포구청',
    stations: [createStationId('2', '236'), createStationId('5', '523')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '당산',
    stations: [createStationId('2', '237'), createStationId('9', '913')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '합정',
    stations: [createStationId('2', '238'), createStationId('6', '610-7')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '홍대입구',
    stations: [createStationId('2', '239')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '충정로',
    stations: [createStationId('2', '243'), createStationId('5', '531')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '까치산',
    stations: [createStationId('2', '234-4'), createStationId('5', '518')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 3호선 환승역
  {
    name: '연신내',
    stations: [createStationId('3', '321'), createStationId('6', '614')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '불광',
    stations: [createStationId('3', '322'), createStationId('6', '612')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '충무로',
    stations: [createStationId('3', '331'), createStationId('4', '426')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '약수',
    stations: [createStationId('3', '333'), createStationId('6', '610-18')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '옥수',
    stations: [createStationId('3', '335')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '고속터미널',
    stations: [
      createStationId('3', '339'),
      createStationId('7', '734'),
      createStationId('9', '923'),
    ],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '양재',
    stations: [createStationId('3', '342')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '도곡',
    stations: [createStationId('3', '344')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '수서',
    stations: [createStationId('3', '349')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '가락시장',
    stations: [createStationId('3', '350'), createStationId('8', '823')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '오금',
    stations: [createStationId('3', '352'), createStationId('5', 'P548-4')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '대곡',
    stations: [createStationId('3', '314')],
    walkTime: LONG_WALK_TIME,
  },

  // 4호선 환승역
  {
    name: '노원',
    stations: [createStationId('4', '414'), createStationId('7', '713')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '삼각지',
    stations: [createStationId('4', '431'), createStationId('6', '610-13')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '이촌',
    stations: [createStationId('4', '433')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '동작',
    stations: [createStationId('4', '434'), createStationId('9', '920')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '총신대입구(이수)',
    stations: [createStationId('4', '435'), createStationId('7', '736')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 5호선 환승역
  {
    name: '김포공항',
    stations: [createStationId('5', '512'), createStationId('9', '902')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '여의도',
    stations: [createStationId('5', '526'), createStationId('9', '915')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '공덕',
    stations: [createStationId('5', '529'), createStationId('6', '610-11')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '청구',
    stations: [createStationId('5', '537'), createStationId('6', '610-19')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '군자',
    stations: [createStationId('5', '544'), createStationId('7', '725')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '천호',
    stations: [createStationId('5', '547'), createStationId('8', '817')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '강동',
    stations: [createStationId('5', '548')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '올림픽공원',
    stations: [createStationId('5', 'P548-2'), createStationId('9', '936')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 6호선 환승역
  {
    name: '태릉입구',
    stations: [createStationId('6', '610-30'), createStationId('7', '717')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 7호선 환승역
  {
    name: '상봉',
    stations: [createStationId('7', '720')],
    walkTime: LONG_WALK_TIME,
  },

  // 8호선 환승역
  {
    name: '석촌',
    stations: [createStationId('8', '821'), createStationId('9', '933')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '복정',
    stations: [createStationId('8', '826')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '모란',
    stations: [createStationId('8', '832')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 9호선 환승역
  {
    name: '신논현',
    stations: [createStationId('9', '925'), createStationId('SBD', 'D03')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '선정릉',
    stations: [createStationId('9', '927'), createStationId('SB', 'K214')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 공항철도(AREX) 환승역
  {
    name: '서울역(공항철도)',
    stations: [
      createStationId('1', '133'),
      createStationId('4', '429'),
      createStationId('AREX', 'A01'),
    ],
    walkTime: VERY_LONG_WALK_TIME, // 공항철도 환승은 거리가 멀음
  },
  {
    name: '공덕(공항철도)',
    stations: [
      createStationId('5', '529'),
      createStationId('6', '610-11'),
      createStationId('AREX', 'A02'),
      createStationId('GJ', 'K337'),
    ],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '홍대입구(공항철도)',
    stations: [
      createStationId('2', '239'),
      createStationId('AREX', 'A03'),
      createStationId('GJ', 'K335'),
    ],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '디지털미디어시티(공항철도)',
    stations: [
      createStationId('6', '610-3'),
      createStationId('AREX', 'A04'),
      createStationId('GJ', 'K333'),
    ],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '마곡나루',
    stations: [createStationId('9', '905'), createStationId('AREX', 'A05')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '김포공항(공항철도)',
    stations: [
      createStationId('5', '512'),
      createStationId('9', '902'),
      createStationId('AREX', 'A06'),
    ],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '청라국제도시',
    stations: [createStationId('7', 'P771'), createStationId('AREX', 'A09')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '검암',
    stations: [createStationId('7', 'P767'), createStationId('AREX', 'A08')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 신분당선(SBD) 환승역
  {
    name: '신사(신분당선)',
    stations: [createStationId('3', '337'), createStationId('SBD', 'D01')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '강남(신분당선)',
    stations: [createStationId('2', '222'), createStationId('SBD', 'D04')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '양재(신분당선)',
    stations: [createStationId('3', '342'), createStationId('SBD', 'D05')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '정자',
    stations: [createStationId('SBD', 'D09'), createStationId('SB', 'K230')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '미금',
    stations: [createStationId('SBD', 'D10'), createStationId('SB', 'K231')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 경의중앙선(GJ) 환승역
  {
    name: '대곡(경의중앙선)',
    stations: [createStationId('3', '314'), createStationId('GJ', 'K327')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '용산(경의중앙선)',
    stations: [createStationId('1', '135'), createStationId('GJ', 'K339')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '이촌(경의중앙선)',
    stations: [createStationId('4', '433'), createStationId('GJ', 'K340')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '옥수(경의중앙선)',
    stations: [createStationId('3', '335'), createStationId('GJ', 'K343')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '왕십리(경의중앙선)',
    stations: [
      createStationId('2', '208'),
      createStationId('5', '540'),
      createStationId('GJ', 'K345'),
      createStationId('SB', 'K210'),
    ],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '청량리(경의중앙선)',
    stations: [
      createStationId('1', '124'),
      createStationId('GJ', 'K346'),
      createStationId('SB', 'K209'),
    ],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '회기(경의중앙선)',
    stations: [createStationId('1', '123'), createStationId('GJ', 'K347')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '상봉(경의중앙선)',
    stations: [createStationId('7', '720'), createStationId('GJ', 'K349')],
    walkTime: DEFAULT_WALK_TIME,
  },

  // 수인분당선(SB) 환승역
  {
    name: '강남구청(수인분당선)',
    stations: [createStationId('7', '730'), createStationId('SB', 'K213')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '선릉(수인분당선)',
    stations: [createStationId('2', '220'), createStationId('SB', 'K215')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '도곡(수인분당선)',
    stations: [createStationId('3', '344'), createStationId('SB', 'K217')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '수서(수인분당선)',
    stations: [createStationId('3', '349'), createStationId('SB', 'K221')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '복정(수인분당선)',
    stations: [createStationId('8', '826'), createStationId('SB', 'K222')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '모란(수인분당선)',
    stations: [createStationId('8', '832'), createStationId('SB', 'K225')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '수원',
    stations: [createStationId('1', 'P154'), createStationId('SB', 'K245')],
    walkTime: LONG_WALK_TIME,
  },
  {
    name: '한대앞',
    stations: [createStationId('4', '452'), createStationId('SB', 'K251')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '중앙',
    stations: [createStationId('4', '453'), createStationId('SB', 'K252')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '고잔',
    stations: [createStationId('4', '454'), createStationId('SB', 'K253')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '초지',
    stations: [createStationId('4', '455'), createStationId('SB', 'K254')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '안산',
    stations: [createStationId('4', '456'), createStationId('SB', 'K255')],
    walkTime: DEFAULT_WALK_TIME,
  },
  {
    name: '오이도',
    stations: [createStationId('4', '459'), createStationId('SB', 'K258')],
    walkTime: DEFAULT_WALK_TIME,
  },
];

/** 역명으로 환승 그룹 검색 */
export function getTransferGroup(stationName: string): TransferGroup | undefined {
  return transfers.find((t) => t.name === stationName || t.name.includes(stationName));
}

/** 역 ID로 환승 가능한 다른 역 ID들 검색 */
export function getTransferStations(stationId: string): string[] {
  for (const transfer of transfers) {
    if (transfer.stations.includes(stationId)) {
      return transfer.stations.filter((id) => id !== stationId);
    }
  }
  return [];
}

/** 두 역이 같은 환승 그룹인지 확인 */
export function areTransferStations(stationId1: string, stationId2: string): boolean {
  for (const transfer of transfers) {
    if (transfer.stations.includes(stationId1) && transfer.stations.includes(stationId2)) {
      return true;
    }
  }
  return false;
}

/** 환승 소요 시간 조회 */
export function getTransferWalkTime(stationId1: string, stationId2: string): number {
  for (const transfer of transfers) {
    if (transfer.stations.includes(stationId1) && transfer.stations.includes(stationId2)) {
      return transfer.walkTime;
    }
  }
  return DEFAULT_WALK_TIME;
}

export default transfers;
