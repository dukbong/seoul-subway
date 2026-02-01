export interface ExitInfo {
  number: number;
  landmark: string;
  landmarkEn: string;
  distance: string;
  facilities: string[];
}

export interface StationExits {
  stationEn: string;
  line: string;
  exits: ExitInfo[];
}

export const exitsData: Record<string, StationExits> = {
  "경복궁": {
    "stationEn": "Gyeongbokgung",
    "line": "3호선",
    "exits": [
      { "number": 5, "landmark": "경복궁", "landmarkEn": "Gyeongbokgung Palace", "distance": "1 min walk", "facilities": ["palace", "museum"] },
      { "number": 3, "landmark": "국립민속박물관", "landmarkEn": "National Folk Museum", "distance": "5 min walk", "facilities": ["museum"] },
      { "number": 4, "landmark": "청와대", "landmarkEn": "Cheongwadae (Blue House)", "distance": "15 min walk", "facilities": ["landmark"] }
    ]
  },
  "안국": {
    "stationEn": "Anguk",
    "line": "3호선",
    "exits": [
      { "number": 3, "landmark": "창덕궁", "landmarkEn": "Changdeokgung Palace", "distance": "5 min walk", "facilities": ["palace"] },
      { "number": 1, "landmark": "인사동", "landmarkEn": "Insadong", "distance": "3 min walk", "facilities": ["shopping", "culture"] },
      { "number": 6, "landmark": "북촌한옥마을", "landmarkEn": "Bukchon Hanok Village", "distance": "10 min walk", "facilities": ["culture", "landmark"] }
    ]
  },
  "명동": {
    "stationEn": "Myeongdong",
    "line": "4호선",
    "exits": [
      { "number": 6, "landmark": "명동거리", "landmarkEn": "Myeongdong Shopping Street", "distance": "1 min walk", "facilities": ["shopping"] },
      { "number": 3, "landmark": "남산케이블카", "landmarkEn": "Namsan Cable Car", "distance": "10 min walk", "facilities": ["landmark"] },
      { "number": 4, "landmark": "명동성당", "landmarkEn": "Myeongdong Cathedral", "distance": "5 min walk", "facilities": ["landmark"] }
    ]
  },
  "동대문": {
    "stationEn": "Dongdaemun",
    "line": "1호선",
    "exits": [
      { "number": 8, "landmark": "동대문시장", "landmarkEn": "Dongdaemun Market", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 6, "landmark": "흥인지문", "landmarkEn": "Heunginjimun Gate", "distance": "5 min walk", "facilities": ["landmark"] }
    ]
  },
  "동대문역사문화공원": {
    "stationEn": "Dongdaemun History & Culture Park",
    "line": "2호선",
    "exits": [
      { "number": 1, "landmark": "DDP (동대문디자인플라자)", "landmarkEn": "DDP (Dongdaemun Design Plaza)", "distance": "1 min walk", "facilities": ["landmark", "culture", "shopping"] },
      { "number": 2, "landmark": "동대문역사관", "landmarkEn": "Dongdaemun History Museum", "distance": "3 min walk", "facilities": ["museum"] }
    ]
  },
  "잠실": {
    "stationEn": "Jamsil",
    "line": "2호선",
    "exits": [
      { "number": 4, "landmark": "롯데월드", "landmarkEn": "Lotte World", "distance": "3 min walk", "facilities": ["theme park", "shopping"] },
      { "number": 3, "landmark": "롯데월드타워", "landmarkEn": "Lotte World Tower", "distance": "5 min walk", "facilities": ["landmark", "shopping"] },
      { "number": 10, "landmark": "석촌호수", "landmarkEn": "Seokchon Lake", "distance": "5 min walk", "facilities": ["park"] },
      { "number": 6, "landmark": "롯데백화점", "landmarkEn": "Lotte Department Store", "distance": "1 min walk", "facilities": ["shopping"] }
    ]
  },
  "강남": {
    "stationEn": "Gangnam",
    "line": "2호선",
    "exits": [
      { "number": 10, "landmark": "강남역 사거리", "landmarkEn": "Gangnam Station Intersection", "distance": "1 min walk", "facilities": ["landmark"] },
      { "number": 11, "landmark": "강남 지하쇼핑센터", "landmarkEn": "Gangnam Underground Shopping", "distance": "direct access", "facilities": ["shopping"] },
      { "number": 5, "landmark": "신논현 방면", "landmarkEn": "Towards Sinnonhyeon", "distance": "1 min walk", "facilities": [] }
    ]
  },
  "삼성": {
    "stationEn": "Samsung",
    "line": "2호선",
    "exits": [
      { "number": 5, "landmark": "코엑스", "landmarkEn": "COEX Mall", "distance": "3 min walk", "facilities": ["shopping", "convention"] },
      { "number": 6, "landmark": "코엑스 아쿠아리움", "landmarkEn": "COEX Aquarium", "distance": "5 min walk", "facilities": ["attraction"] },
      { "number": 7, "landmark": "봉은사", "landmarkEn": "Bongeunsa Temple", "distance": "10 min walk", "facilities": ["temple"] },
      { "number": 3, "landmark": "현대백화점 무역센터점", "landmarkEn": "Hyundai Department Store", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "홍대입구": {
    "stationEn": "Hongik Univ.",
    "line": "2호선",
    "exits": [
      { "number": 9, "landmark": "홍대 걷고 싶은 거리", "landmarkEn": "Hongdae Walking Street", "distance": "3 min walk", "facilities": ["shopping", "nightlife"] },
      { "number": 8, "landmark": "홍익대학교", "landmarkEn": "Hongik University", "distance": "5 min walk", "facilities": ["university"] },
      { "number": 1, "landmark": "경의선 숲길", "landmarkEn": "Gyeongui Line Forest Park", "distance": "3 min walk", "facilities": ["park"] },
      { "number": 5, "landmark": "합정 방면", "landmarkEn": "Towards Hapjeong", "distance": "1 min walk", "facilities": [] }
    ]
  },
  "서울역": {
    "stationEn": "Seoul Station",
    "line": "1호선",
    "exits": [
      { "number": 1, "landmark": "서울역 (KTX/SRT)", "landmarkEn": "Seoul Station (KTX/SRT)", "distance": "3 min walk", "facilities": ["train station"] },
      { "number": 2, "landmark": "롯데마트 서울역점", "landmarkEn": "Lotte Mart Seoul Station", "distance": "5 min walk", "facilities": ["shopping"] },
      { "number": 10, "landmark": "남대문시장", "landmarkEn": "Namdaemun Market", "distance": "10 min walk", "facilities": ["shopping"] },
      { "number": 15, "landmark": "서울로 7017", "landmarkEn": "Seoullo 7017", "distance": "5 min walk", "facilities": ["park", "landmark"] }
    ]
  },
  "고속터미널": {
    "stationEn": "Express Bus Terminal",
    "line": "3호선",
    "exits": [
      { "number": 4, "landmark": "서울고속버스터미널 (경부선)", "landmarkEn": "Seoul Express Bus Terminal (Gyeongbu)", "distance": "3 min walk", "facilities": ["bus terminal"] },
      { "number": 8, "landmark": "센트럴시티 (호남선)", "landmarkEn": "Central City Terminal (Honam)", "distance": "5 min walk", "facilities": ["bus terminal", "shopping"] },
      { "number": 7, "landmark": "신세계백화점", "landmarkEn": "Shinsegae Department Store", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 3, "landmark": "메리어트 호텔", "landmarkEn": "JW Marriott Hotel", "distance": "5 min walk", "facilities": ["hotel"] }
    ]
  },
  "김포공항": {
    "stationEn": "Gimpo Airport",
    "line": "5호선",
    "exits": [
      { "number": 3, "landmark": "김포공항 국내선", "landmarkEn": "Gimpo Airport Domestic Terminal", "distance": "5 min walk", "facilities": ["airport"] },
      { "number": 1, "landmark": "김포공항 국제선", "landmarkEn": "Gimpo Airport International Terminal", "distance": "8 min walk", "facilities": ["airport"] },
      { "number": 2, "landmark": "롯데몰 김포공항", "landmarkEn": "Lotte Mall Gimpo Airport", "distance": "direct access", "facilities": ["shopping"] }
    ]
  },
  "인천공항1터미널": {
    "stationEn": "Incheon Airport T1",
    "line": "공항철도",
    "exits": [
      { "number": 1, "landmark": "제1여객터미널", "landmarkEn": "Terminal 1", "distance": "direct access", "facilities": ["airport"] },
      { "number": 2, "landmark": "교통센터", "landmarkEn": "Transportation Center", "distance": "5 min walk", "facilities": ["bus terminal", "car rental"] }
    ]
  },
  "인천공항2터미널": {
    "stationEn": "Incheon Airport T2",
    "line": "공항철도",
    "exits": [
      { "number": 1, "landmark": "제2여객터미널", "landmarkEn": "Terminal 2", "distance": "direct access", "facilities": ["airport"] }
    ]
  },
  "이태원": {
    "stationEn": "Itaewon",
    "line": "6호선",
    "exits": [
      { "number": 1, "landmark": "이태원 메인거리", "landmarkEn": "Itaewon Main Street", "distance": "1 min walk", "facilities": ["shopping", "nightlife", "dining"] },
      { "number": 3, "landmark": "해밀턴호텔", "landmarkEn": "Hamilton Hotel", "distance": "3 min walk", "facilities": ["hotel"] },
      { "number": 4, "landmark": "녹사평 방면", "landmarkEn": "Towards Noksapyeong", "distance": "1 min walk", "facilities": [] }
    ]
  },
  "신촌": {
    "stationEn": "Sinchon",
    "line": "2호선",
    "exits": [
      { "number": 2, "landmark": "신촌 연세로", "landmarkEn": "Sinchon Yonsei-ro", "distance": "1 min walk", "facilities": ["shopping"] },
      { "number": 3, "landmark": "연세대학교", "landmarkEn": "Yonsei University", "distance": "10 min walk", "facilities": ["university"] },
      { "number": 1, "landmark": "현대백화점 신촌점", "landmarkEn": "Hyundai Department Store Sinchon", "distance": "3 min walk", "facilities": ["shopping"] }
    ]
  },
  "건대입구": {
    "stationEn": "Konkuk Univ.",
    "line": "2호선",
    "exits": [
      { "number": 2, "landmark": "건국대학교", "landmarkEn": "Konkuk University", "distance": "5 min walk", "facilities": ["university"] },
      { "number": 6, "landmark": "커먼그라운드", "landmarkEn": "Common Ground", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 5, "landmark": "스타시티", "landmarkEn": "Star City Mall", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "여의도": {
    "stationEn": "Yeouido",
    "line": "5호선",
    "exits": [
      { "number": 5, "landmark": "여의도공원", "landmarkEn": "Yeouido Park", "distance": "3 min walk", "facilities": ["park"] },
      { "number": 1, "landmark": "IFC몰", "landmarkEn": "IFC Mall", "distance": "5 min walk", "facilities": ["shopping"] },
      { "number": 3, "landmark": "63빌딩", "landmarkEn": "63 Building", "distance": "15 min walk", "facilities": ["landmark"] },
      { "number": 4, "landmark": "여의도 한강공원", "landmarkEn": "Yeouido Hangang Park", "distance": "10 min walk", "facilities": ["park"] }
    ]
  },
  "압구정": {
    "stationEn": "Apgujeong",
    "line": "3호선",
    "exits": [
      { "number": 3, "landmark": "압구정 로데오거리", "landmarkEn": "Apgujeong Rodeo Street", "distance": "5 min walk", "facilities": ["shopping"] },
      { "number": 2, "landmark": "갤러리아백화점", "landmarkEn": "Galleria Department Store", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "청담": {
    "stationEn": "Cheongdam",
    "line": "7호선",
    "exits": [
      { "number": 9, "landmark": "청담동 명품거리", "landmarkEn": "Cheongdam Luxury Street", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 14, "landmark": "SM엔터테인먼트", "landmarkEn": "SM Entertainment", "distance": "5 min walk", "facilities": ["landmark"] }
    ]
  },
  "광화문": {
    "stationEn": "Gwanghwamun",
    "line": "5호선",
    "exits": [
      { "number": 2, "landmark": "광화문광장", "landmarkEn": "Gwanghwamun Square", "distance": "3 min walk", "facilities": ["landmark"] },
      { "number": 1, "landmark": "세종문화회관", "landmarkEn": "Sejong Center for the Performing Arts", "distance": "5 min walk", "facilities": ["culture"] },
      { "number": 3, "landmark": "경복궁", "landmarkEn": "Gyeongbokgung Palace", "distance": "10 min walk", "facilities": ["palace"] },
      { "number": 7, "landmark": "교보문고", "landmarkEn": "Kyobo Bookstore", "distance": "3 min walk", "facilities": ["shopping"] }
    ]
  },
  "종로3가": {
    "stationEn": "Jongno 3-ga",
    "line": "1호선",
    "exits": [
      { "number": 6, "landmark": "탑골공원", "landmarkEn": "Tapgol Park", "distance": "3 min walk", "facilities": ["park"] },
      { "number": 1, "landmark": "종묘", "landmarkEn": "Jongmyo Shrine", "distance": "5 min walk", "facilities": ["landmark"] },
      { "number": 5, "landmark": "익선동", "landmarkEn": "Ikseon-dong", "distance": "5 min walk", "facilities": ["culture", "dining"] }
    ]
  },
  "을지로입구": {
    "stationEn": "Euljiro 1-ga",
    "line": "2호선",
    "exits": [
      { "number": 7, "landmark": "롯데백화점 본점", "landmarkEn": "Lotte Department Store Main", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 8, "landmark": "롯데영플라자", "landmarkEn": "Lotte Young Plaza", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 6, "landmark": "청계천", "landmarkEn": "Cheonggyecheon Stream", "distance": "5 min walk", "facilities": ["landmark"] }
    ]
  },
  "합정": {
    "stationEn": "Hapjeong",
    "line": "2호선",
    "exits": [
      { "number": 3, "landmark": "합정역 카페거리", "landmarkEn": "Hapjeong Cafe Street", "distance": "3 min walk", "facilities": ["dining"] },
      { "number": 5, "landmark": "메세나폴리스", "landmarkEn": "Mecenatpolis", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "선릉": {
    "stationEn": "Seolleung",
    "line": "2호선",
    "exits": [
      { "number": 8, "landmark": "선정릉 (선릉)", "landmarkEn": "Seolleung Royal Tomb", "distance": "5 min walk", "facilities": ["landmark"] },
      { "number": 10, "landmark": "강남 업무지구", "landmarkEn": "Gangnam Business District", "distance": "3 min walk", "facilities": [] }
    ]
  },
  "양재": {
    "stationEn": "Yangjae",
    "line": "3호선",
    "exits": [
      { "number": 10, "landmark": "양재 시민의숲", "landmarkEn": "Yangjae Citizens' Forest", "distance": "10 min walk", "facilities": ["park"] },
      { "number": 7, "landmark": "양재 하나로마트", "landmarkEn": "Hanaro Mart Yangjae", "distance": "5 min walk", "facilities": ["shopping"] },
      { "number": 12, "landmark": "aT센터", "landmarkEn": "aT Center", "distance": "5 min walk", "facilities": ["convention"] }
    ]
  },
  "사당": {
    "stationEn": "Sadang",
    "line": "2호선",
    "exits": [
      { "number": 14, "landmark": "남부터미널 연결", "landmarkEn": "Connection to Nambu Terminal", "distance": "10 min walk", "facilities": ["bus terminal"] },
      { "number": 1, "landmark": "사당시장", "landmarkEn": "Sadang Market", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "왕십리": {
    "stationEn": "Wangsimni",
    "line": "2호선",
    "exits": [
      { "number": 9, "landmark": "비트플렉스", "landmarkEn": "Bitplex", "distance": "direct access", "facilities": ["shopping"] },
      { "number": 10, "landmark": "이마트", "landmarkEn": "E-Mart", "distance": "3 min walk", "facilities": ["shopping"] }
    ]
  },
  "공덕": {
    "stationEn": "Gongdeok",
    "line": "5호선",
    "exits": [
      { "number": 9, "landmark": "마포문화비축기지", "landmarkEn": "Mapo Oil Depot", "distance": "15 min walk", "facilities": ["culture", "park"] },
      { "number": 6, "landmark": "효창공원", "landmarkEn": "Hyochang Park", "distance": "10 min walk", "facilities": ["park"] }
    ]
  }
};
