import type { LineData } from '../../../lib/types/graph';

/** 2호선 본선 (순환선) */
export const line2: LineData = {
  id: '2',
  name: '2호선',
  nameEn: 'Line 2',
  isSeoulMetro: true,
  isCircular: true,
  stations: [
    { code: '201', name: '시청', nameEn: 'City Hall' },
    { code: '202', name: '을지로입구', nameEn: 'Euljiro 1-ga' },
    { code: '203', name: '을지로3가', nameEn: 'Euljiro 3-ga' },
    { code: '204', name: '을지로4가', nameEn: 'Euljiro 4-ga' },
    { code: '205', name: '동대문역사문화공원', nameEn: 'Dongdaemun History & Culture Park' },
    { code: '206', name: '신당', nameEn: 'Sindang' },
    { code: '207', name: '상왕십리', nameEn: 'Sangwangsimni' },
    { code: '208', name: '왕십리', nameEn: 'Wangsimni' },
    { code: '209', name: '한양대', nameEn: 'Hanyang Univ.' },
    { code: '210', name: '뚝섬', nameEn: 'Ttukseom' },
    { code: '211', name: '성수', nameEn: 'Seongsu' },
    { code: '212', name: '건대입구', nameEn: 'Konkuk Univ.' },
    { code: '213', name: '구의', nameEn: 'Guui' },
    { code: '214', name: '강변', nameEn: 'Gangbyeon' },
    { code: '215', name: '잠실나루', nameEn: 'Jamsillaru' },
    { code: '216', name: '잠실', nameEn: 'Jamsil' },
    { code: '217', name: '잠실새내', nameEn: 'Jamsilsaenae' },
    { code: '218', name: '종합운동장', nameEn: 'Sports Complex' },
    { code: '219', name: '삼성', nameEn: 'Samseong' },
    { code: '220', name: '선릉', nameEn: 'Seolleung' },
    { code: '221', name: '역삼', nameEn: 'Yeoksam' },
    { code: '222', name: '강남', nameEn: 'Gangnam' },
    { code: '223', name: '교대', nameEn: 'Seoul Nat\'l Univ. of Education' },
    { code: '224', name: '서초', nameEn: 'Seocho' },
    { code: '225', name: '방배', nameEn: 'Bangbae' },
    { code: '226', name: '사당', nameEn: 'Sadang' },
    { code: '227', name: '낙성대', nameEn: 'Nakseongdae' },
    { code: '228', name: '서울대입구', nameEn: 'Seoul Nat\'l Univ.' },
    { code: '229', name: '봉천', nameEn: 'Bongcheon' },
    { code: '230', name: '신림', nameEn: 'Sillim' },
    { code: '231', name: '신대방', nameEn: 'Sindaebang' },
    { code: '232', name: '구로디지털단지', nameEn: 'Guro Digital Complex' },
    { code: '233', name: '대림', nameEn: 'Daerim' },
    { code: '234', name: '신도림', nameEn: 'Sindorim' },
    { code: '235', name: '문래', nameEn: 'Mullae' },
    { code: '236', name: '영등포구청', nameEn: 'Yeongdeungpo-gu Office' },
    { code: '237', name: '당산', nameEn: 'Dangsan' },
    { code: '238', name: '합정', nameEn: 'Hapjeong' },
    { code: '239', name: '홍대입구', nameEn: 'Hongik Univ.' },
    { code: '240', name: '신촌', nameEn: 'Sinchon' },
    { code: '241', name: '이대', nameEn: 'Ewha Womans Univ.' },
    { code: '242', name: '아현', nameEn: 'Ahyeon' },
    { code: '243', name: '충정로', nameEn: 'Chungjeongno' },
    // 시청(201)으로 순환
  ],
};

/** 2호선 성수지선 */
export const line2Seongsu: LineData = {
  id: '2',
  name: '2호선 성수지선',
  nameEn: 'Line 2 Seongsu Branch',
  isSeoulMetro: true,
  isCircular: false,
  stations: [
    { code: '211', name: '성수', nameEn: 'Seongsu' },
    { code: '211-1', name: '용답', nameEn: 'Yongdap' },
    { code: '211-2', name: '신답', nameEn: 'Sindap' },
    { code: '211-3', name: '용두', nameEn: 'Yongdu' },
    { code: '211-4', name: '신설동', nameEn: 'Sinseol-dong' },
  ],
};

/** 2호선 신정지선 */
export const line2Sinjeong: LineData = {
  id: '2',
  name: '2호선 신정지선',
  nameEn: 'Line 2 Sinjeong Branch',
  isSeoulMetro: true,
  isCircular: false,
  stations: [
    { code: '234', name: '신도림', nameEn: 'Sindorim' },
    { code: '234-1', name: '도림천', nameEn: 'Dorimcheon' },
    { code: '234-2', name: '양천구청', nameEn: 'Yangcheon-gu Office' },
    { code: '234-3', name: '신정네거리', nameEn: 'Sinjeong-negeori' },
    { code: '234-4', name: '까치산', nameEn: 'Kkachisan' },
  ],
};

export default line2;
