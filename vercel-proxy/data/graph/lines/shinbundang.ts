import type { LineData } from '../../../lib/types/graph';

/** 신분당선 역 데이터 (신사 ~ 광교) */
export const shinbundang: LineData = {
  id: 'SBD',
  name: '신분당선',
  nameEn: 'Sinbundang Line',
  isSeoulMetro: false,
  isCircular: false,
  stations: [
    { code: 'D01', name: '신사', nameEn: 'Sinsa' },
    { code: 'D02', name: '논현', nameEn: 'Nonhyeon' },
    { code: 'D03', name: '신논현', nameEn: 'Sinnonhyeon' },
    { code: 'D04', name: '강남', nameEn: 'Gangnam' },
    { code: 'D05', name: '양재', nameEn: 'Yangjae' },
    { code: 'D06', name: '양재시민의숲', nameEn: 'Yangjae Citizen\'s Forest' },
    { code: 'D07', name: '청계산입구', nameEn: 'Cheonggyesan' },
    { code: 'D08', name: '판교', nameEn: 'Pangyo' },
    { code: 'D09', name: '정자', nameEn: 'Jeongja' },
    { code: 'D10', name: '미금', nameEn: 'Migeum' },
    { code: 'D11', name: '동천', nameEn: 'Dongcheon' },
    { code: 'D12', name: '수지구청', nameEn: 'Suji-gu Office' },
    { code: 'D13', name: '성복', nameEn: 'Seongbok' },
    { code: 'D14', name: '상현', nameEn: 'Sanghyeon' },
    { code: 'D15', name: '광교중앙', nameEn: 'Gwanggyo Jungang' },
    { code: 'D16', name: '광교', nameEn: 'Gwanggyo' },
  ],
};

export default shinbundang;
