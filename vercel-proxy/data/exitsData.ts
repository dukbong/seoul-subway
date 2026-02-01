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
  },
  // === 추가 핵심 환승역 ===
  "신도림": {
    "stationEn": "Sindorim",
    "line": "1호선",
    "exits": [
      { "number": 1, "landmark": "디큐브시티", "landmarkEn": "D-Cube City", "distance": "direct access", "facilities": ["shopping", "culture"] },
      { "number": 3, "landmark": "신도림역 환승센터", "landmarkEn": "Sindorim Transfer Center", "distance": "1 min walk", "facilities": ["bus terminal"] },
      { "number": 5, "landmark": "신도림 테크노마트", "landmarkEn": "Sindorim Techno Mart", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "교대": {
    "stationEn": "Seoul Nat'l Univ. of Education",
    "line": "2호선",
    "exits": [
      { "number": 3, "landmark": "서울교육대학교", "landmarkEn": "Seoul Nat'l Univ. of Education", "distance": "3 min walk", "facilities": ["university"] },
      { "number": 14, "landmark": "법원·검찰청", "landmarkEn": "Courts & Prosecutors' Office", "distance": "5 min walk", "facilities": ["landmark"] },
      { "number": 6, "landmark": "예술의전당 방면", "landmarkEn": "Towards Seoul Arts Center", "distance": "10 min walk", "facilities": ["culture"] }
    ]
  },
  "충무로": {
    "stationEn": "Chungmuro",
    "line": "3호선",
    "exits": [
      { "number": 4, "landmark": "필동 먹자골목", "landmarkEn": "Pildong Restaurant Alley", "distance": "3 min walk", "facilities": ["dining"] },
      { "number": 7, "landmark": "남산골한옥마을", "landmarkEn": "Namsangol Hanok Village", "distance": "10 min walk", "facilities": ["culture", "landmark"] },
      { "number": 2, "landmark": "충무아트센터", "landmarkEn": "Chungmu Art Center", "distance": "5 min walk", "facilities": ["culture"] }
    ]
  },
  "신당": {
    "stationEn": "Sindang",
    "line": "2호선",
    "exits": [
      { "number": 7, "landmark": "신당역 떡볶이타운", "landmarkEn": "Sindang Tteokbokki Town", "distance": "3 min walk", "facilities": ["dining"] },
      { "number": 1, "landmark": "중앙시장", "landmarkEn": "Jungang Market", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "성수": {
    "stationEn": "Seongsu",
    "line": "2호선",
    "exits": [
      { "number": 3, "landmark": "성수동 카페거리", "landmarkEn": "Seongsu Cafe Street", "distance": "5 min walk", "facilities": ["dining", "culture"] },
      { "number": 4, "landmark": "서울숲", "landmarkEn": "Seoul Forest", "distance": "10 min walk", "facilities": ["park"] },
      { "number": 1, "landmark": "성수 수제화거리", "landmarkEn": "Seongsu Handmade Shoes Street", "distance": "3 min walk", "facilities": ["shopping"] }
    ]
  },
  "용산": {
    "stationEn": "Yongsan",
    "line": "1호선",
    "exits": [
      { "number": 1, "landmark": "용산역 (KTX)", "landmarkEn": "Yongsan Station (KTX)", "distance": "3 min walk", "facilities": ["train station"] },
      { "number": 3, "landmark": "아이파크몰", "landmarkEn": "I'Park Mall", "distance": "direct access", "facilities": ["shopping"] },
      { "number": 4, "landmark": "전쟁기념관", "landmarkEn": "War Memorial of Korea", "distance": "10 min walk", "facilities": ["museum"] }
    ]
  },
  "노량진": {
    "stationEn": "Noryangjin",
    "line": "1호선",
    "exits": [
      { "number": 1, "landmark": "노량진수산시장", "landmarkEn": "Noryangjin Fish Market", "distance": "5 min walk", "facilities": ["shopping", "dining"] },
      { "number": 7, "landmark": "컵스빌딩 (학원가)", "landmarkEn": "Cups Building (Academy Area)", "distance": "3 min walk", "facilities": ["education"] }
    ]
  },
  "당산": {
    "stationEn": "Dangsan",
    "line": "2호선",
    "exits": [
      { "number": 4, "landmark": "당산역 먹자골목", "landmarkEn": "Dangsan Restaurant Alley", "distance": "3 min walk", "facilities": ["dining"] },
      { "number": 12, "landmark": "선유도공원", "landmarkEn": "Seonyudo Park", "distance": "15 min walk", "facilities": ["park"] }
    ]
  },
  "을지로3가": {
    "stationEn": "Euljiro 3-ga",
    "line": "2호선",
    "exits": [
      { "number": 4, "landmark": "을지로 노가리골목", "landmarkEn": "Euljiro Nogari Alley", "distance": "3 min walk", "facilities": ["dining", "nightlife"] },
      { "number": 10, "landmark": "세운상가", "landmarkEn": "Sewoon Arcade", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "을지로4가": {
    "stationEn": "Euljiro 4-ga",
    "line": "2호선",
    "exits": [
      { "number": 4, "landmark": "방산시장", "landmarkEn": "Bangsan Market", "distance": "5 min walk", "facilities": ["shopping"] },
      { "number": 7, "landmark": "광장시장", "landmarkEn": "Gwangjang Market", "distance": "5 min walk", "facilities": ["shopping", "dining"] }
    ]
  },
  "천호": {
    "stationEn": "Cheonho",
    "line": "5호선",
    "exits": [
      { "number": 7, "landmark": "현대백화점 천호점", "landmarkEn": "Hyundai Department Store Cheonho", "distance": "direct access", "facilities": ["shopping"] },
      { "number": 1, "landmark": "천호 로데오거리", "landmarkEn": "Cheonho Rodeo Street", "distance": "3 min walk", "facilities": ["shopping"] }
    ]
  },
  "군자": {
    "stationEn": "Gunja",
    "line": "5호선",
    "exits": [
      { "number": 3, "landmark": "능동 어린이대공원", "landmarkEn": "Children's Grand Park", "distance": "10 min walk", "facilities": ["park", "attraction"] },
      { "number": 1, "landmark": "세종대학교", "landmarkEn": "Sejong University", "distance": "5 min walk", "facilities": ["university"] }
    ]
  },
  "삼각지": {
    "stationEn": "Samgakji",
    "line": "4호선",
    "exits": [
      { "number": 12, "landmark": "전쟁기념관", "landmarkEn": "War Memorial of Korea", "distance": "5 min walk", "facilities": ["museum"] },
      { "number": 1, "landmark": "용산 미군기지 부지", "landmarkEn": "Yongsan US Army Base Site", "distance": "5 min walk", "facilities": ["landmark"] }
    ]
  },
  "디지털미디어시티": {
    "stationEn": "Digital Media City",
    "line": "6호선",
    "exits": [
      { "number": 2, "landmark": "MBC 방송센터", "landmarkEn": "MBC Broadcasting Center", "distance": "5 min walk", "facilities": ["landmark"] },
      { "number": 9, "landmark": "상암월드컵경기장", "landmarkEn": "Seoul World Cup Stadium", "distance": "10 min walk", "facilities": ["sports"] },
      { "number": 7, "landmark": "하늘공원·노을공원", "landmarkEn": "Sky Park & Noeul Park", "distance": "15 min walk", "facilities": ["park"] }
    ]
  },
  "종합운동장": {
    "stationEn": "Sports Complex",
    "line": "2호선",
    "exits": [
      { "number": 6, "landmark": "잠실종합운동장", "landmarkEn": "Jamsil Sports Complex", "distance": "3 min walk", "facilities": ["sports"] },
      { "number": 1, "landmark": "잠실야구장", "landmarkEn": "Jamsil Baseball Stadium", "distance": "5 min walk", "facilities": ["sports"] },
      { "number": 5, "landmark": "올림픽주경기장", "landmarkEn": "Olympic Main Stadium", "distance": "5 min walk", "facilities": ["sports"] }
    ]
  },
  "신논현": {
    "stationEn": "Sinnonhyeon",
    "line": "9호선",
    "exits": [
      { "number": 5, "landmark": "강남역 방면", "landmarkEn": "Towards Gangnam Station", "distance": "5 min walk", "facilities": [] },
      { "number": 3, "landmark": "경기고등학교", "landmarkEn": "Kyunggi High School", "distance": "3 min walk", "facilities": ["education"] }
    ]
  },
  "강남구청": {
    "stationEn": "Gangnam-gu Office",
    "line": "7호선",
    "exits": [
      { "number": 5, "landmark": "강남구청", "landmarkEn": "Gangnam-gu Office", "distance": "3 min walk", "facilities": ["landmark"] },
      { "number": 1, "landmark": "학동역 방면", "landmarkEn": "Towards Hakdong", "distance": "5 min walk", "facilities": [] }
    ]
  },
  "복정": {
    "stationEn": "Bokjeong",
    "line": "8호선",
    "exits": [
      { "number": 2, "landmark": "성남시청 방면", "landmarkEn": "Towards Seongnam City Hall", "distance": "10 min walk", "facilities": ["landmark"] },
      { "number": 1, "landmark": "복정역 환승주차장", "landmarkEn": "Bokjeong Park & Ride", "distance": "3 min walk", "facilities": ["parking"] }
    ]
  },
  "모란": {
    "stationEn": "Moran",
    "line": "8호선",
    "exits": [
      { "number": 1, "landmark": "모란민속5일장", "landmarkEn": "Moran Folk Market", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 3, "landmark": "성남아트센터 방면", "landmarkEn": "Towards Seongnam Arts Center", "distance": "10 min walk", "facilities": ["culture"] }
    ]
  },
  // === 관광/대학/업무 주요역 ===
  "혜화": {
    "stationEn": "Hyehwa",
    "line": "4호선",
    "exits": [
      { "number": 2, "landmark": "대학로 공연거리", "landmarkEn": "Daehak-ro Theater Street", "distance": "1 min walk", "facilities": ["culture"] },
      { "number": 1, "landmark": "마로니에공원", "landmarkEn": "Marronnier Park", "distance": "3 min walk", "facilities": ["park", "culture"] },
      { "number": 4, "landmark": "성균관대학교", "landmarkEn": "Sungkyunkwan University", "distance": "10 min walk", "facilities": ["university"] }
    ]
  },
  "이대": {
    "stationEn": "Ewha Womans Univ.",
    "line": "2호선",
    "exits": [
      { "number": 2, "landmark": "이화여자대학교", "landmarkEn": "Ewha Womans University", "distance": "5 min walk", "facilities": ["university"] },
      { "number": 3, "landmark": "이대 패션거리", "landmarkEn": "Ewha Fashion Street", "distance": "3 min walk", "facilities": ["shopping"] }
    ]
  },
  "서울대입구": {
    "stationEn": "Seoul Nat'l Univ.",
    "line": "2호선",
    "exits": [
      { "number": 3, "landmark": "서울대학교 셔틀버스", "landmarkEn": "Seoul Nat'l Univ. Shuttle Bus", "distance": "1 min walk", "facilities": ["university"] },
      { "number": 2, "landmark": "샤로수길", "landmarkEn": "Sharosu-gil", "distance": "3 min walk", "facilities": ["dining", "shopping"] }
    ]
  },
  "신사": {
    "stationEn": "Sinsa",
    "line": "3호선",
    "exits": [
      { "number": 8, "landmark": "가로수길", "landmarkEn": "Garosu-gil", "distance": "3 min walk", "facilities": ["shopping", "dining"] },
      { "number": 1, "landmark": "압구정 방면", "landmarkEn": "Towards Apgujeong", "distance": "1 min walk", "facilities": [] }
    ]
  },
  "역삼": {
    "stationEn": "Yeoksam",
    "line": "2호선",
    "exits": [
      { "number": 1, "landmark": "GS타워", "landmarkEn": "GS Tower", "distance": "1 min walk", "facilities": ["landmark"] },
      { "number": 3, "landmark": "테헤란로", "landmarkEn": "Teheran-ro", "distance": "1 min walk", "facilities": ["business"] },
      { "number": 7, "landmark": "포스코 P&S타워", "landmarkEn": "POSCO P&S Tower", "distance": "3 min walk", "facilities": ["business"] }
    ]
  },
  "시청": {
    "stationEn": "City Hall",
    "line": "1호선",
    "exits": [
      { "number": 1, "landmark": "서울시청", "landmarkEn": "Seoul City Hall", "distance": "1 min walk", "facilities": ["landmark"] },
      { "number": 2, "landmark": "덕수궁", "landmarkEn": "Deoksugung Palace", "distance": "3 min walk", "facilities": ["palace"] },
      { "number": 5, "landmark": "서울광장", "landmarkEn": "Seoul Plaza", "distance": "1 min walk", "facilities": ["landmark"] }
    ]
  },
  "이촌": {
    "stationEn": "Ichon",
    "line": "4호선",
    "exits": [
      { "number": 2, "landmark": "국립중앙박물관", "landmarkEn": "National Museum of Korea", "distance": "10 min walk", "facilities": ["museum"] },
      { "number": 4, "landmark": "이촌 한강공원", "landmarkEn": "Ichon Hangang Park", "distance": "5 min walk", "facilities": ["park"] }
    ]
  },
  "뚝섬": {
    "stationEn": "Ttukseom",
    "line": "2호선",
    "exits": [
      { "number": 1, "landmark": "서울숲", "landmarkEn": "Seoul Forest", "distance": "5 min walk", "facilities": ["park"] },
      { "number": 8, "landmark": "뚝섬한강공원", "landmarkEn": "Ttukseom Hangang Park", "distance": "10 min walk", "facilities": ["park"] }
    ]
  },
  "강변": {
    "stationEn": "Gangbyeon",
    "line": "2호선",
    "exits": [
      { "number": 1, "landmark": "동서울종합터미널", "landmarkEn": "Dong Seoul Bus Terminal", "distance": "3 min walk", "facilities": ["bus terminal"] },
      { "number": 4, "landmark": "테크노마트", "landmarkEn": "Techno Mart", "distance": "direct access", "facilities": ["shopping"] }
    ]
  },
  "판교": {
    "stationEn": "Pangyo",
    "line": "신분당선",
    "exits": [
      { "number": 1, "landmark": "판교테크노밸리", "landmarkEn": "Pangyo Techno Valley", "distance": "5 min walk", "facilities": ["business"] },
      { "number": 2, "landmark": "현대백화점 판교점", "landmarkEn": "Hyundai Department Store Pangyo", "distance": "direct access", "facilities": ["shopping"] }
    ]
  },
  "정자": {
    "stationEn": "Jeongja",
    "line": "신분당선",
    "exits": [
      { "number": 5, "landmark": "네이버 본사", "landmarkEn": "Naver Headquarters", "distance": "10 min walk", "facilities": ["business"] },
      { "number": 1, "landmark": "정자동 카페거리", "landmarkEn": "Jeongja Cafe Street", "distance": "5 min walk", "facilities": ["dining"] }
    ]
  },
  "수유": {
    "stationEn": "Suyu",
    "line": "4호선",
    "exits": [
      { "number": 3, "landmark": "북한산 등산로입구", "landmarkEn": "Bukhansan Trail Entrance", "distance": "15 min walk", "facilities": ["park"] },
      { "number": 1, "landmark": "수유시장", "landmarkEn": "Suyu Market", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "사가정": {
    "stationEn": "Sagajeong",
    "line": "7호선",
    "exits": [
      { "number": 4, "landmark": "사가정공원", "landmarkEn": "Sagajeong Park", "distance": "5 min walk", "facilities": ["park"] },
      { "number": 1, "landmark": "면목동 먹자골목", "landmarkEn": "Myeonmok Restaurant Alley", "distance": "3 min walk", "facilities": ["dining"] }
    ]
  },
  "상봉": {
    "stationEn": "Sangbong",
    "line": "7호선",
    "exits": [
      { "number": 1, "landmark": "상봉터미널", "landmarkEn": "Sangbong Terminal", "distance": "5 min walk", "facilities": ["bus terminal"] },
      { "number": 3, "landmark": "이마트 상봉점", "landmarkEn": "E-Mart Sangbong", "distance": "3 min walk", "facilities": ["shopping"] }
    ]
  },
  "옥수": {
    "stationEn": "Oksu",
    "line": "3호선",
    "exits": [
      { "number": 3, "landmark": "옥수동 카페거리", "landmarkEn": "Oksu Cafe Street", "distance": "5 min walk", "facilities": ["dining"] },
      { "number": 1, "landmark": "응봉산 개나리동산", "landmarkEn": "Eungbongsan Forsythia Hill", "distance": "15 min walk", "facilities": ["park"] }
    ]
  },
  "약수": {
    "stationEn": "Yaksu",
    "line": "3호선",
    "exits": [
      { "number": 3, "landmark": "약수역 먹자골목", "landmarkEn": "Yaksu Restaurant Alley", "distance": "3 min walk", "facilities": ["dining"] },
      { "number": 1, "landmark": "다산공원", "landmarkEn": "Dasan Park", "distance": "10 min walk", "facilities": ["park"] }
    ]
  },
  "효창공원앞": {
    "stationEn": "Hyochang Park",
    "line": "6호선",
    "exits": [
      { "number": 1, "landmark": "효창공원", "landmarkEn": "Hyochang Park", "distance": "3 min walk", "facilities": ["park", "landmark"] },
      { "number": 3, "landmark": "백범김구기념관", "landmarkEn": "Kim Koo Museum & Library", "distance": "5 min walk", "facilities": ["museum"] }
    ]
  },
  "영등포": {
    "stationEn": "Yeongdeungpo",
    "line": "1호선",
    "exits": [
      { "number": 3, "landmark": "신세계백화점 영등포점", "landmarkEn": "Shinsegae Department Store", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 5, "landmark": "타임스퀘어", "landmarkEn": "Times Square", "distance": "5 min walk", "facilities": ["shopping"] },
      { "number": 2, "landmark": "영등포시장", "landmarkEn": "Yeongdeungpo Market", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "구로": {
    "stationEn": "Guro",
    "line": "1호선",
    "exits": [
      { "number": 1, "landmark": "구로디지털단지 방면", "landmarkEn": "Towards Guro Digital Complex", "distance": "5 min walk", "facilities": [] },
      { "number": 4, "landmark": "신도림역 방면", "landmarkEn": "Towards Sindorim", "distance": "10 min walk", "facilities": [] }
    ]
  },
  "종각": {
    "stationEn": "Jonggak",
    "line": "1호선",
    "exits": [
      { "number": 4, "landmark": "보신각", "landmarkEn": "Bosingak Pavilion", "distance": "1 min walk", "facilities": ["landmark"] },
      { "number": 3, "landmark": "종로타워", "landmarkEn": "Jongno Tower", "distance": "1 min walk", "facilities": ["landmark"] },
      { "number": 5, "landmark": "영풍문고", "landmarkEn": "Youngpoong Bookstore", "distance": "direct access", "facilities": ["shopping"] }
    ]
  },
  "연신내": {
    "stationEn": "Yeonsinnae",
    "line": "3호선",
    "exits": [
      { "number": 3, "landmark": "연신내 먹자골목", "landmarkEn": "Yeonsinnae Restaurant Alley", "distance": "3 min walk", "facilities": ["dining"] },
      { "number": 6, "landmark": "은평뉴타운", "landmarkEn": "Eunpyeong New Town", "distance": "10 min walk", "facilities": [] }
    ]
  },
  "불광": {
    "stationEn": "Bulgwang",
    "line": "3호선",
    "exits": [
      { "number": 2, "landmark": "롯데몰 은평점", "landmarkEn": "Lotte Mall Eunpyeong", "distance": "10 min walk", "facilities": ["shopping"] },
      { "number": 3, "landmark": "불광천", "landmarkEn": "Bulgwangcheon Stream", "distance": "5 min walk", "facilities": ["park"] }
    ]
  },
  "응암": {
    "stationEn": "Eungam",
    "line": "6호선",
    "exits": [
      { "number": 2, "landmark": "응암시장", "landmarkEn": "Eungam Market", "distance": "5 min walk", "facilities": ["shopping"] },
      { "number": 4, "landmark": "백련산", "landmarkEn": "Baengnyeonsan Mountain", "distance": "15 min walk", "facilities": ["park"] }
    ]
  },
  "마포구청": {
    "stationEn": "Mapo-gu Office",
    "line": "5호선",
    "exits": [
      { "number": 2, "landmark": "마포구청", "landmarkEn": "Mapo-gu Office", "distance": "3 min walk", "facilities": ["landmark"] },
      { "number": 3, "landmark": "마포아트센터", "landmarkEn": "Mapo Art Center", "distance": "5 min walk", "facilities": ["culture"] }
    ]
  },
  "광나루": {
    "stationEn": "Gwangnaru",
    "line": "5호선",
    "exits": [
      { "number": 2, "landmark": "아차산 등산로입구", "landmarkEn": "Achasan Trail Entrance", "distance": "10 min walk", "facilities": ["park"] },
      { "number": 1, "landmark": "광나루한강공원", "landmarkEn": "Gwangnaru Hangang Park", "distance": "10 min walk", "facilities": ["park"] }
    ]
  },
  "올림픽공원": {
    "stationEn": "Olympic Park",
    "line": "5호선",
    "exits": [
      { "number": 3, "landmark": "올림픽공원", "landmarkEn": "Olympic Park", "distance": "1 min walk", "facilities": ["park", "sports"] },
      { "number": 1, "landmark": "소마미술관", "landmarkEn": "SOMA Museum of Art", "distance": "5 min walk", "facilities": ["museum"] },
      { "number": 4, "landmark": "핸드볼경기장", "landmarkEn": "Handball Gymnasium", "distance": "5 min walk", "facilities": ["sports"] }
    ]
  },
  "몽촌토성": {
    "stationEn": "Mongchontoseong",
    "line": "8호선",
    "exits": [
      { "number": 1, "landmark": "올림픽공원 평화의문", "landmarkEn": "World Peace Gate", "distance": "3 min walk", "facilities": ["landmark", "park"] },
      { "number": 3, "landmark": "한성백제박물관", "landmarkEn": "Hanseong Baekje Museum", "distance": "5 min walk", "facilities": ["museum"] }
    ]
  },
  "가산디지털단지": {
    "stationEn": "Gasan Digital Complex",
    "line": "1호선",
    "exits": [
      { "number": 4, "landmark": "마리오아울렛", "landmarkEn": "Mario Outlet", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 7, "landmark": "롯데아울렛 가산점", "landmarkEn": "Lotte Outlet Gasan", "distance": "direct access", "facilities": ["shopping"] },
      { "number": 5, "landmark": "W몰", "landmarkEn": "W Mall", "distance": "5 min walk", "facilities": ["shopping"] }
    ]
  },
  "대림": {
    "stationEn": "Daerim",
    "line": "2호선",
    "exits": [
      { "number": 12, "landmark": "대림중앙시장", "landmarkEn": "Daerim Central Market", "distance": "3 min walk", "facilities": ["shopping"] },
      { "number": 3, "landmark": "차이나타운", "landmarkEn": "Chinatown", "distance": "5 min walk", "facilities": ["dining", "shopping"] }
    ]
  }
};
