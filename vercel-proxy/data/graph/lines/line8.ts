import type { LineData } from '../../../lib/types/graph';

/** 8호선 역 데이터 (암사 ~ 모란) */
export const line8: LineData = {
  id: '8',
  name: '8호선',
  nameEn: 'Line 8',
  isSeoulMetro: true,
  isCircular: false,
  stations: [
    { code: '810', name: '별내', nameEn: 'Byeollae' },
    { code: '811', name: '다산', nameEn: 'Dasan' },
    { code: '812', name: '동구릉', nameEn: 'Dongguneung' },
    { code: '813', name: '구리', nameEn: 'Guri' },
    { code: '814', name: '장자호수공원', nameEn: 'Jangja Lake Park' },
    { code: '815', name: '암사역사공원', nameEn: 'Amsa Historic Park' },
    { code: '816', name: '암사', nameEn: 'Amsa' },
    { code: '817', name: '천호', nameEn: 'Cheonho' },
    { code: '818', name: '강동구청', nameEn: 'Gangdong-gu Office' },
    { code: '819', name: '몽촌토성', nameEn: 'Mongchontoseong' },
    { code: '820', name: '잠실', nameEn: 'Jamsil' },
    { code: '821', name: '석촌', nameEn: 'Seokchon' },
    { code: '822', name: '송파', nameEn: 'Songpa' },
    { code: '823', name: '가락시장', nameEn: 'Garak Market' },
    { code: '824', name: '문정', nameEn: 'Munjeong' },
    { code: '825', name: '장지', nameEn: 'Jangji' },
    { code: '826', name: '복정', nameEn: 'Bokjeong' },
    { code: '827', name: '산성', nameEn: 'Sanseong' },
    { code: '828', name: '남한산성입구', nameEn: 'Namhansanseong' },
    { code: '829', name: '단대오거리', nameEn: 'Dandae Ogeori' },
    { code: '830', name: '신흥', nameEn: 'Sinheung' },
    { code: '831', name: '수진', nameEn: 'Sujin' },
    { code: '832', name: '모란', nameEn: 'Moran' },
  ],
};

export default line8;
