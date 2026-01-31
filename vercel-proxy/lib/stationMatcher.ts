import stationNames from '../../data/station-names.json';

/**
 * Cache for normalized strings to avoid repeated computation
 */
const normalizeCache = new Map<string, string>();
const CACHE_MAX_SIZE = 500;

/**
 * Normalize station name: lowercase, remove spaces and special characters
 * Results are cached for performance
 */
function normalize(str: string): string {
  if (normalizeCache.has(str)) return normalizeCache.get(str)!;

  const result = str.toLowerCase().replace(/[\s\-_.()]/g, '');

  if (normalizeCache.size < CACHE_MAX_SIZE) {
    normalizeCache.set(str, result);
  }
  return result;
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
  'yonsei': '신촌',
  'yonseiuniversity': '신촌',
  'yonseiuniv': '신촌',
  'sogang': '신촌',
  'soganguniversity': '신촌',
  'soganguniv': '신촌',
  'hanyang': '왕십리',
  'hanyanguniversity': '왕십리',
  'hanyanguniv': '왕십리',
  'cau': '흑석',
  'chunganguniversity': '흑석',
  'chunganguniv': '흑석',
  'skku': '혜화',
  'sungkyunkwan': '혜화',
  'sungkyunkwanuniversity': '혜화',

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
  'gmp': '김포공항',
  'icn': '인천공항1터미널',

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
  'ddp': '동대문역사문화공원',
  'dongdaemundesignplaza': '동대문역사문화공원',

  // Station suffix variations
  'gangnamstation': '강남',
};

// Add aliases to the normalized map
for (const [alias, korean] of Object.entries(aliases)) {
  normalizedMap.set(normalize(alias), korean);
}

/**
 * Match English station name to Korean (case-insensitive, space-insensitive)
 * Supports fuzzy matching with Levenshtein distance <= 1
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

  // 3. Fuzzy match with distance <= 1 (conservative typo tolerance)
  let bestMatch: { korean: string; distance: number } | null = null;
  for (const [key, korean] of normalizedMap) {
    const dist = levenshteinDistance(normalized, key, 1);
    if (dist === 1 && (!bestMatch || key.length > bestMatch.korean.length)) {
      bestMatch = { korean, distance: dist };
    }
  }

  if (bestMatch) {
    return bestMatch.korean;
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
    const dist = levenshteinDistance(normalized, key, 3);
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
 * Optimized with O(min(n,m)) space complexity and early exit
 * @param a - First string
 * @param b - Second string
 * @param threshold - Optional early exit threshold
 * @returns Levenshtein distance (or threshold + 1 if exceeds threshold)
 */
function levenshteinDistance(a: string, b: string, threshold?: number): number {
  // Early exit: length difference exceeds threshold
  if (threshold !== undefined && Math.abs(a.length - b.length) > threshold) {
    return threshold + 1;
  }

  // Ensure a is the shorter string for space optimization
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  // O(min(n,m)) space - use two 1D arrays instead of 2D matrix
  let prev = Array.from({ length: a.length + 1 }, (_, i) => i);
  let curr = new Array(a.length + 1);

  for (let j = 1; j <= b.length; j++) {
    curr[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        curr[i - 1] + 1,      // insertion
        prev[i] + 1,          // deletion
        prev[i - 1] + cost    // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[a.length];
}
