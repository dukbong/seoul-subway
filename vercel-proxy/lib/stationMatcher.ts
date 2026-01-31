import stationNames from '../../data/station-names.json';

/**
 * Normalize station name: lowercase, remove spaces and special characters
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[\s\-_.()]/g, '');
}

// Build normalized mapping table from station-names.json
const normalizedMap = new Map<string, string>();
for (const [english, korean] of Object.entries(stationNames.englishToKorean)) {
  normalizedMap.set(normalize(english), korean);
}

// Additional aliases for common variations
const aliases: Record<string, string> = {
  // University variations
  'hongik': '홍대입구',
  'hongikuniversity': '홍대입구',
  'hongikuniv': '홍대입구',
  'hongdae': '홍대입구',
  'ewha': '이대',
  'ewhauniv': '이대',
  'ewhauniversity': '이대',
  'snu': '서울대입구',
  'seoulnationaluniversity': '서울대입구',
  'seoulnatluniv': '서울대입구',
  'koreauniversity': '고려대',
  'ku': '건대입구',
  'konkuniversity': '건대입구',
  'konkuniv': '건대입구',

  // Seoul Station variations
  'seoulstation': '서울역',
  'seoulstn': '서울역',

  // Airport variations
  'incheonairport': '인천공항1터미널',
  'icnairport': '인천공항1터미널',
  'icnt1': '인천공항1터미널',
  'icnt2': '인천공항2터미널',
  'gimpo': '김포공항',
  'gimpoairport': '김포공항',

  // Terminal variations
  'expressterminal': '고속터미널',
  'expressbus': '고속터미널',
  'expressbusterminal': '고속터미널',
  'nambuterminal': '남부터미널',

  // Landmark variations
  'gyeongbokpalace': '경복궁',
  'changdeokpalace': '안국',
  'nseoultower': '명동',
  'namsan': '명동',
  'coex': '삼성',
  'lotteworld': '잠실',

  // Station suffix variations
  'gangnamstation': '강남',
};

// Add aliases to the normalized map
for (const [alias, korean] of Object.entries(aliases)) {
  normalizedMap.set(normalize(alias), korean);
}

/**
 * Match English station name to Korean (case-insensitive, space-insensitive)
 * @param input - Station name input (English or Korean)
 * @returns Korean station name or null if not found
 */
export function matchStation(input: string): string | null {
  const normalized = normalize(input);

  // 1. Try exact match in normalized map
  if (normalizedMap.has(normalized)) {
    return normalizedMap.get(normalized)!;
  }

  // 2. Korean input - return as-is
  if (/[\uAC00-\uD7AF]/.test(input)) {
    return input;
  }

  return null;
}

/**
 * Suggest similar station names for typos using Levenshtein distance
 * @param input - Misspelled station name
 * @param limit - Maximum number of suggestions
 * @returns Array of Korean station name suggestions
 */
export function suggestStations(input: string, limit = 3): string[] {
  const normalized = normalize(input);
  const suggestions: { name: string; distance: number }[] = [];
  const seen = new Set<string>();

  for (const [key, korean] of normalizedMap) {
    const dist = levenshteinDistance(normalized, key);
    if (dist <= 3 && !seen.has(korean)) {
      suggestions.push({ name: korean, distance: dist });
      seen.add(korean);
    }
  }

  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(s => s.name);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,       // insertion
        matrix[j - 1][i] + 1,       // deletion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}
