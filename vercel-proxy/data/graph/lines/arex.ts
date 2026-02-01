import type { LineData } from '../../../lib/types/graph.js';

/** 공항철도 (AREX) 역 데이터 (서울역 ~ 인천공항2터미널) */
export const arex: LineData = {
  id: 'AREX',
  name: '공항철도',
  nameEn: 'Airport Railroad Express',
  isSeoulMetro: false,
  isCircular: false,
  stations: [
    { code: 'A01', name: '서울역', nameEn: 'Seoul Station' },
    { code: 'A02', name: '공덕', nameEn: 'Gongdeok' },
    { code: 'A03', name: '홍대입구', nameEn: 'Hongik Univ.' },
    { code: 'A04', name: '디지털미디어시티', nameEn: 'Digital Media City' },
    { code: 'A05', name: '마곡나루', nameEn: 'Magongnaru' },
    { code: 'A06', name: '김포공항', nameEn: 'Gimpo Int\'l Airport' },
    { code: 'A07', name: '계양', nameEn: 'Gyeyang' },
    { code: 'A08', name: '검암', nameEn: 'Geomam' },
    { code: 'A09', name: '청라국제도시', nameEn: 'Cheongna Int\'l City' },
    { code: 'A10', name: '영종', nameEn: 'Yeongjong' },
    { code: 'A11', name: '운서', nameEn: 'Unseo' },
    { code: 'A12', name: '공항화물청사', nameEn: 'Airport Cargo Terminal' },
    { code: 'A13', name: '인천공항1터미널', nameEn: 'Incheon Int\'l Airport Terminal 1' },
    { code: 'A14', name: '인천공항2터미널', nameEn: 'Incheon Int\'l Airport Terminal 2' },
  ],
};

export default arex;
