export interface LastTrainScheduleEntry {
  direction: string;
  directionEn: string;
  time: string;
  destination: string;
  destinationEn: string;
}

export interface LineSchedule {
  line: string;
  lineEn: string;
  weekday: LastTrainScheduleEntry[];
  saturday: LastTrainScheduleEntry[];
  sunday: LastTrainScheduleEntry[];
}

export interface LastTrainSchedule {
  stationEn: string;
  lines: LineSchedule[];
}

/**
 * Static last train schedule data for major stations
 * Data collected from Seoul Metro official timetables
 * Last updated: 2025-01
 */
export const lastTrainData: Record<string, LastTrainSchedule> = {
  "강남": {
    stationEn: "Gangnam",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:32", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:25", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:32", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:25", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:02", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "23:55", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "신분당선",
        lineEn: "Sinbundang Line",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "신사", destinationEn: "Sinsa" },
          { direction: "하행", directionEn: "Downbound", time: "00:05", destination: "광교", destinationEn: "Gwanggyo" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "신사", destinationEn: "Sinsa" },
          { direction: "하행", directionEn: "Downbound", time: "00:05", destination: "광교", destinationEn: "Gwanggyo" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:30", destination: "신사", destinationEn: "Sinsa" },
          { direction: "하행", directionEn: "Downbound", time: "23:35", destination: "광교", destinationEn: "Gwanggyo" }
        ]
      }
    ]
  },
  "홍대입구": {
    stationEn: "Hongik Univ.",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:30", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:35", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:30", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:35", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:00", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:05", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "공항철도",
        lineEn: "Airport Railroad",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "23:50", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:42", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "23:50", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:42", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:20", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:12", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ]
      },
      {
        line: "경의중앙선",
        lineEn: "Gyeongui-Jungang Line",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:17", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "00:06", destination: "문산", destinationEn: "Munsan" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:17", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "00:06", destination: "문산", destinationEn: "Munsan" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:47", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:36", destination: "문산", destinationEn: "Munsan" }
        ]
      }
    ]
  },
  "서울역": {
    stationEn: "Seoul Station",
    lines: [
      {
        line: "1호선",
        lineEn: "Line 1",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "소요산", destinationEn: "Soyosan" },
          { direction: "하행", directionEn: "Downbound", time: "00:22", destination: "인천", destinationEn: "Incheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "소요산", destinationEn: "Soyosan" },
          { direction: "하행", directionEn: "Downbound", time: "00:22", destination: "인천", destinationEn: "Incheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:30", destination: "소요산", destinationEn: "Soyosan" },
          { direction: "하행", directionEn: "Downbound", time: "23:52", destination: "인천", destinationEn: "Incheon" }
        ]
      },
      {
        line: "4호선",
        lineEn: "Line 4",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:01", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "00:20", destination: "오이도", destinationEn: "Oido" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:01", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "00:20", destination: "오이도", destinationEn: "Oido" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:31", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "23:50", destination: "오이도", destinationEn: "Oido" }
        ]
      },
      {
        line: "공항철도",
        lineEn: "Airport Railroad",
        weekday: [
          { direction: "하행", directionEn: "Downbound", time: "23:40", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        saturday: [
          { direction: "하행", directionEn: "Downbound", time: "23:40", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        sunday: [
          { direction: "하행", directionEn: "Downbound", time: "23:10", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ]
      },
      {
        line: "경의중앙선",
        lineEn: "Gyeongui-Jungang Line",
        weekday: [
          { direction: "하행", directionEn: "Downbound", time: "00:10", destination: "문산", destinationEn: "Munsan" }
        ],
        saturday: [
          { direction: "하행", directionEn: "Downbound", time: "00:10", destination: "문산", destinationEn: "Munsan" }
        ],
        sunday: [
          { direction: "하행", directionEn: "Downbound", time: "23:40", destination: "문산", destinationEn: "Munsan" }
        ]
      }
    ]
  },
  "명동": {
    stationEn: "Myeongdong",
    lines: [
      {
        line: "4호선",
        lineEn: "Line 4",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "00:17", destination: "오이도", destinationEn: "Oido" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "00:17", destination: "오이도", destinationEn: "Oido" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:35", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "23:47", destination: "오이도", destinationEn: "Oido" }
        ]
      }
    ]
  },
  "경복궁": {
    stationEn: "Gyeongbokgung",
    lines: [
      {
        line: "3호선",
        lineEn: "Line 3",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:11", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:26", destination: "오금", destinationEn: "Ogeum" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:11", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:26", destination: "오금", destinationEn: "Ogeum" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:41", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:56", destination: "오금", destinationEn: "Ogeum" }
        ]
      }
    ]
  },
  "안국": {
    stationEn: "Anguk",
    lines: [
      {
        line: "3호선",
        lineEn: "Line 3",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:08", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:29", destination: "오금", destinationEn: "Ogeum" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:08", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:29", destination: "오금", destinationEn: "Ogeum" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:38", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:59", destination: "오금", destinationEn: "Ogeum" }
        ]
      }
    ]
  },
  "동대문역사문화공원": {
    stationEn: "Dongdaemun History & Culture Park",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:42", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:14", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:42", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:14", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:12", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "23:44", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "4호선",
        lineEn: "Line 4",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:08", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "00:14", destination: "오이도", destinationEn: "Oido" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:08", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "00:14", destination: "오이도", destinationEn: "Oido" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:38", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "23:44", destination: "오이도", destinationEn: "Oido" }
        ]
      },
      {
        line: "5호선",
        lineEn: "Line 5",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:15", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:04", destination: "마천", destinationEn: "Macheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:15", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:04", destination: "마천", destinationEn: "Macheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:45", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:34", destination: "마천", destinationEn: "Macheon" }
        ]
      }
    ]
  },
  "잠실": {
    stationEn: "Jamsil",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:21", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:36", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:21", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:36", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "23:51", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:06", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "8호선",
        lineEn: "Line 8",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "암사", destinationEn: "Amsa" },
          { direction: "하행", directionEn: "Downbound", time: "00:05", destination: "모란", destinationEn: "Moran" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "암사", destinationEn: "Amsa" },
          { direction: "하행", directionEn: "Downbound", time: "00:05", destination: "모란", destinationEn: "Moran" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:30", destination: "암사", destinationEn: "Amsa" },
          { direction: "하행", directionEn: "Downbound", time: "23:35", destination: "모란", destinationEn: "Moran" }
        ]
      }
    ]
  },
  "삼성": {
    stationEn: "Samsung",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:27", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:30", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:27", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:30", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "23:57", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:00", destination: "신도림", destinationEn: "Sindorim" }
        ]
      }
    ]
  },
  "이태원": {
    stationEn: "Itaewon",
    lines: [
      {
        line: "6호선",
        lineEn: "Line 6",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "00:03", destination: "봉화산", destinationEn: "Bonghwasan" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "00:03", destination: "봉화산", destinationEn: "Bonghwasan" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:30", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "23:33", destination: "봉화산", destinationEn: "Bonghwasan" }
        ]
      }
    ]
  },
  "신촌": {
    stationEn: "Sinchon",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:26", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:38", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:26", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:38", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "23:56", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:08", destination: "신도림", destinationEn: "Sindorim" }
        ]
      }
    ]
  },
  "고속터미널": {
    stationEn: "Express Bus Terminal",
    lines: [
      {
        line: "3호선",
        lineEn: "Line 3",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:25", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:13", destination: "오금", destinationEn: "Ogeum" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:25", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:13", destination: "오금", destinationEn: "Ogeum" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:55", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:43", destination: "오금", destinationEn: "Ogeum" }
        ]
      },
      {
        line: "7호선",
        lineEn: "Line 7",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:10", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "00:05", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:10", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "00:05", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:40", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "23:35", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ]
      },
      {
        line: "9호선",
        lineEn: "Line 9",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:03", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:00", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:03", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:00", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:33", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:30", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ]
      }
    ]
  },
  "김포공항": {
    stationEn: "Gimpo Airport",
    lines: [
      {
        line: "5호선",
        lineEn: "Line 5",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:21", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:46", destination: "마천", destinationEn: "Macheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:21", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:46", destination: "마천", destinationEn: "Macheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:51", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:16", destination: "마천", destinationEn: "Macheon" }
        ]
      },
      {
        line: "9호선",
        lineEn: "Line 9",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:23", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:43", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:23", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:43", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:53", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:13", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ]
      },
      {
        line: "공항철도",
        lineEn: "Airport Railroad",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "23:57", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:35", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "23:57", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:35", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:27", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:05", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ]
      }
    ]
  },
  "인천공항1터미널": {
    stationEn: "Incheon Airport T1",
    lines: [
      {
        line: "공항철도",
        lineEn: "Airport Railroad",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "23:45", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:50", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "23:45", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:50", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:15", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:20", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ]
      }
    ]
  },
  "인천공항2터미널": {
    stationEn: "Incheon Airport T2",
    lines: [
      {
        line: "공항철도",
        lineEn: "Airport Railroad",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "23:40", destination: "서울역", destinationEn: "Seoul Station" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "23:40", destination: "서울역", destinationEn: "Seoul Station" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:10", destination: "서울역", destinationEn: "Seoul Station" }
        ]
      }
    ]
  },
  "여의도": {
    stationEn: "Yeouido",
    lines: [
      {
        line: "5호선",
        lineEn: "Line 5",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:10", destination: "마천", destinationEn: "Macheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:10", destination: "마천", destinationEn: "Macheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:35", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:40", destination: "마천", destinationEn: "Macheon" }
        ]
      },
      {
        line: "9호선",
        lineEn: "Line 9",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:10", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:55", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:10", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:55", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:40", destination: "개화", destinationEn: "Gaehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:25", destination: "중앙보훈병원", destinationEn: "Central Veterans Hospital" }
        ]
      }
    ]
  },
  "선릉": {
    stationEn: "Seolleung",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:30", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:27", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:30", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:27", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:00", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "23:57", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "수인분당선",
        lineEn: "Suin-Bundang Line",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:14", destination: "청량리", destinationEn: "Cheongnyangni" },
          { direction: "하행", directionEn: "Downbound", time: "00:03", destination: "인천", destinationEn: "Incheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:14", destination: "청량리", destinationEn: "Cheongnyangni" },
          { direction: "하행", directionEn: "Downbound", time: "00:03", destination: "인천", destinationEn: "Incheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:44", destination: "청량리", destinationEn: "Cheongnyangni" },
          { direction: "하행", directionEn: "Downbound", time: "23:33", destination: "인천", destinationEn: "Incheon" }
        ]
      }
    ]
  },
  "종로3가": {
    stationEn: "Jongno 3-ga",
    lines: [
      {
        line: "1호선",
        lineEn: "Line 1",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:09", destination: "소요산", destinationEn: "Soyosan" },
          { direction: "하행", directionEn: "Downbound", time: "00:14", destination: "인천", destinationEn: "Incheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:09", destination: "소요산", destinationEn: "Soyosan" },
          { direction: "하행", directionEn: "Downbound", time: "00:14", destination: "인천", destinationEn: "Incheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:39", destination: "소요산", destinationEn: "Soyosan" },
          { direction: "하행", directionEn: "Downbound", time: "23:44", destination: "인천", destinationEn: "Incheon" }
        ]
      },
      {
        line: "3호선",
        lineEn: "Line 3",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:32", destination: "오금", destinationEn: "Ogeum" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:32", destination: "오금", destinationEn: "Ogeum" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:35", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:02", destination: "오금", destinationEn: "Ogeum" }
        ]
      },
      {
        line: "5호선",
        lineEn: "Line 5",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:18", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:01", destination: "마천", destinationEn: "Macheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:18", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:01", destination: "마천", destinationEn: "Macheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:48", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:31", destination: "마천", destinationEn: "Macheon" }
        ]
      }
    ]
  },
  "을지로입구": {
    stationEn: "Euljiro 1-ga",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:39", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:17", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:39", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:17", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:09", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "23:47", destination: "신도림", destinationEn: "Sindorim" }
        ]
      }
    ]
  },
  "광화문": {
    stationEn: "Gwanghwamun",
    lines: [
      {
        line: "5호선",
        lineEn: "Line 5",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:16", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:03", destination: "마천", destinationEn: "Macheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:16", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:03", destination: "마천", destinationEn: "Macheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:46", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:33", destination: "마천", destinationEn: "Macheon" }
        ]
      }
    ]
  },
  "합정": {
    stationEn: "Hapjeong",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:28", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:37", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:28", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:37", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "23:58", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:07", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "6호선",
        lineEn: "Line 6",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:08", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "23:55", destination: "봉화산", destinationEn: "Bonghwasan" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:08", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "23:55", destination: "봉화산", destinationEn: "Bonghwasan" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:38", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "23:25", destination: "봉화산", destinationEn: "Bonghwasan" }
        ]
      }
    ]
  },
  "건대입구": {
    stationEn: "Konkuk Univ.",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:45", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:12", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:45", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:12", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:15", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "23:42", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "7호선",
        lineEn: "Line 7",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "00:10", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "00:10", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:30", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "23:40", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ]
      }
    ]
  },
  "왕십리": {
    stationEn: "Wangsimni",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:48", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:09", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:48", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:09", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:18", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "23:39", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "5호선",
        lineEn: "Line 5",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:08", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:11", destination: "마천", destinationEn: "Macheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:08", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:11", destination: "마천", destinationEn: "Macheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:38", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:41", destination: "마천", destinationEn: "Macheon" }
        ]
      },
      {
        line: "수인분당선",
        lineEn: "Suin-Bundang Line",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:20", destination: "청량리", destinationEn: "Cheongnyangni" },
          { direction: "하행", directionEn: "Downbound", time: "23:57", destination: "인천", destinationEn: "Incheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:20", destination: "청량리", destinationEn: "Cheongnyangni" },
          { direction: "하행", directionEn: "Downbound", time: "23:57", destination: "인천", destinationEn: "Incheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:50", destination: "청량리", destinationEn: "Cheongnyangni" },
          { direction: "하행", directionEn: "Downbound", time: "23:27", destination: "인천", destinationEn: "Incheon" }
        ]
      },
      {
        line: "경의중앙선",
        lineEn: "Gyeongui-Jungang Line",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:30", destination: "문산", destinationEn: "Munsan" },
          { direction: "하행", directionEn: "Downbound", time: "00:15", destination: "용문", destinationEn: "Yongmun" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:30", destination: "문산", destinationEn: "Munsan" },
          { direction: "하행", directionEn: "Downbound", time: "00:15", destination: "용문", destinationEn: "Yongmun" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "00:00", destination: "문산", destinationEn: "Munsan" },
          { direction: "하행", directionEn: "Downbound", time: "23:45", destination: "용문", destinationEn: "Yongmun" }
        ]
      }
    ]
  },
  "사당": {
    stationEn: "Sadang",
    lines: [
      {
        line: "2호선",
        lineEn: "Line 2",
        weekday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:16", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:41", destination: "신도림", destinationEn: "Sindorim" }
        ],
        saturday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "00:16", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:41", destination: "신도림", destinationEn: "Sindorim" }
        ],
        sunday: [
          { direction: "내선순환", directionEn: "Inner Circle", time: "23:46", destination: "성수", destinationEn: "Seongsu" },
          { direction: "외선순환", directionEn: "Outer Circle", time: "00:11", destination: "신도림", destinationEn: "Sindorim" }
        ]
      },
      {
        line: "4호선",
        lineEn: "Line 4",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:22", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "23:58", destination: "오이도", destinationEn: "Oido" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:22", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "23:58", destination: "오이도", destinationEn: "Oido" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:52", destination: "당고개", destinationEn: "Danggogae" },
          { direction: "하행", directionEn: "Downbound", time: "23:28", destination: "오이도", destinationEn: "Oido" }
        ]
      }
    ]
  },
  "공덕": {
    stationEn: "Gongdeok",
    lines: [
      {
        line: "5호선",
        lineEn: "Line 5",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:03", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:12", destination: "마천", destinationEn: "Macheon" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:03", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:12", destination: "마천", destinationEn: "Macheon" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:33", destination: "방화", destinationEn: "Banghwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:42", destination: "마천", destinationEn: "Macheon" }
        ]
      },
      {
        line: "6호선",
        lineEn: "Line 6",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:12", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "23:51", destination: "봉화산", destinationEn: "Bonghwasan" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:12", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "23:51", destination: "봉화산", destinationEn: "Bonghwasan" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:42", destination: "응암순환", destinationEn: "Eungam Loop" },
          { direction: "하행", directionEn: "Downbound", time: "23:21", destination: "봉화산", destinationEn: "Bonghwasan" }
        ]
      },
      {
        line: "공항철도",
        lineEn: "Airport Railroad",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "23:54", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:38", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "23:54", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:38", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:24", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:08", destination: "인천공항2터미널", destinationEn: "Incheon Airport T2" }
        ]
      },
      {
        line: "경의중앙선",
        lineEn: "Gyeongui-Jungang Line",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:13", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "00:08", destination: "문산", destinationEn: "Munsan" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:13", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "00:08", destination: "문산", destinationEn: "Munsan" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:43", destination: "서울역", destinationEn: "Seoul Station" },
          { direction: "하행", directionEn: "Downbound", time: "23:38", destination: "문산", destinationEn: "Munsan" }
        ]
      }
    ]
  },
  "압구정": {
    stationEn: "Apgujeong",
    lines: [
      {
        line: "3호선",
        lineEn: "Line 3",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:28", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:10", destination: "오금", destinationEn: "Ogeum" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:28", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:10", destination: "오금", destinationEn: "Ogeum" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:58", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:40", destination: "오금", destinationEn: "Ogeum" }
        ]
      }
    ]
  },
  "청담": {
    stationEn: "Cheongdam",
    lines: [
      {
        line: "7호선",
        lineEn: "Line 7",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "00:03", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "00:03", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:35", destination: "장암", destinationEn: "Jangam" },
          { direction: "하행", directionEn: "Downbound", time: "23:33", destination: "부평구청", destinationEn: "Bupyeong-gu Office" }
        ]
      }
    ]
  },
  "양재": {
    stationEn: "Yangjae",
    lines: [
      {
        line: "3호선",
        lineEn: "Line 3",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:32", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:06", destination: "오금", destinationEn: "Ogeum" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:32", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "00:06", destination: "오금", destinationEn: "Ogeum" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "00:02", destination: "대화", destinationEn: "Daehwa" },
          { direction: "하행", directionEn: "Downbound", time: "23:36", destination: "오금", destinationEn: "Ogeum" }
        ]
      },
      {
        line: "신분당선",
        lineEn: "Sinbundang Line",
        weekday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "신사", destinationEn: "Sinsa" },
          { direction: "하행", directionEn: "Downbound", time: "00:00", destination: "광교", destinationEn: "Gwanggyo" }
        ],
        saturday: [
          { direction: "상행", directionEn: "Upbound", time: "00:05", destination: "신사", destinationEn: "Sinsa" },
          { direction: "하행", directionEn: "Downbound", time: "00:00", destination: "광교", destinationEn: "Gwanggyo" }
        ],
        sunday: [
          { direction: "상행", directionEn: "Upbound", time: "23:35", destination: "신사", destinationEn: "Sinsa" },
          { direction: "하행", directionEn: "Downbound", time: "23:30", destination: "광교", destinationEn: "Gwanggyo" }
        ]
      }
    ]
  }
};

/**
 * Get available stations in the static data
 */
export function getAvailableStations(): string[] {
  return Object.keys(lastTrainData);
}

/**
 * Check if a station has static last train data
 */
export function hasLastTrainData(station: string): boolean {
  return station in lastTrainData;
}
