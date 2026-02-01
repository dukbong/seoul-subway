import { stationNames } from './stationNamesData.js';
import { MATCHER_CONFIG } from './constants.js';

/**
 * Enhanced suggestion result with additional metadata
 */
export interface StationSuggestion {
  korean: string;
  english?: string;
  distance: number;
}

/**
 * Cache for normalized strings to avoid repeated computation
 */
const normalizeCache = new Map<string, string>();

/**
 * LRU Cache for matchStation results
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

const matchStationCache = new LRUCache<string, string | null>(MATCHER_CONFIG.MATCH_CACHE_SIZE);

/**
 * Normalize station name: lowercase, remove spaces and special characters
 * Results are cached for performance
 */
function normalize(str: string): string {
  if (normalizeCache.has(str)) return normalizeCache.get(str)!;

  const result = str.toLowerCase().replace(/[\s\-_.()]/g, '');

  if (normalizeCache.size < MATCHER_CONFIG.NORMALIZE_CACHE_SIZE) {
    normalizeCache.set(str, result);
  }
  return result;
}

// Build normalized mapping table from station-names.json
const normalizedMap = new Map<string, string>();
for (const [english, korean] of Object.entries(stationNames.englishToKorean)) {
  normalizedMap.set(normalize(english), korean);
}

// Build reverse lookup: Korean to English (for suggestions)
const koreanToEnglishMap = new Map<string, string>();
for (const [korean, english] of Object.entries(stationNames.koreanToEnglish)) {
  koreanToEnglishMap.set(korean, english);
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

// Build length-based index for faster Levenshtein filtering
const lengthIndex = new Map<number, Array<{ key: string; korean: string }>>();
for (const [key, korean] of normalizedMap) {
  const len = key.length;
  if (!lengthIndex.has(len)) {
    lengthIndex.set(len, []);
  }
  lengthIndex.get(len)!.push({ key, korean });
}

/**
 * Get candidate entries within length threshold for Levenshtein distance
 */
function getCandidatesByLength(targetLength: number, threshold: number): Array<{ key: string; korean: string }> {
  const candidates: Array<{ key: string; korean: string }> = [];
  for (let len = targetLength - threshold; len <= targetLength + threshold; len++) {
    const entries = lengthIndex.get(len);
    if (entries) {
      candidates.push(...entries);
    }
  }
  return candidates;
}

/**
 * Match English station name to Korean (case-insensitive, space-insensitive)
 * Supports fuzzy matching with Levenshtein distance <= 1
 * @param input - Station name input (English or Korean)
 * @returns Korean station name or null if not found
 */
export function matchStation(input: string): string | null {
  // Check cache first
  if (matchStationCache.has(input)) {
    return matchStationCache.get(input)!;
  }

  const normalized = normalize(input);

  // 1. Try exact match in normalized map
  if (normalizedMap.has(normalized)) {
    const result = normalizedMap.get(normalized)!;
    matchStationCache.set(input, result);
    return result;
  }

  // 2. Korean input - return as-is
  if (/[\uAC00-\uD7AF]/.test(input)) {
    matchStationCache.set(input, input);
    return input;
  }

  // 3. Fuzzy match with distance <= 1 (conservative typo tolerance)
  // Use length-based filtering for better performance
  const candidates = getCandidatesByLength(normalized.length, MATCHER_CONFIG.FUZZY_MATCH_THRESHOLD);
  let bestMatch: { korean: string; distance: number } | null = null;

  for (const { key, korean } of candidates) {
    const dist = levenshteinDistance(normalized, key, MATCHER_CONFIG.FUZZY_MATCH_THRESHOLD);
    if (dist === 1 && (!bestMatch || key.length > bestMatch.korean.length)) {
      bestMatch = { korean, distance: dist };
    }
  }

  if (bestMatch) {
    matchStationCache.set(input, bestMatch.korean);
    return bestMatch.korean;
  }

  matchStationCache.set(input, null);
  return null;
}

/**
 * Suggest similar station names for typos using Levenshtein distance
 * Returns enhanced suggestions with English names and distance info
 * @param input - Misspelled station name
 * @param limit - Maximum number of suggestions
 * @returns Array of station suggestions with metadata
 */
export function suggestStationsEnhanced(input: string, limit: number = MATCHER_CONFIG.DEFAULT_SUGGESTION_LIMIT): StationSuggestion[] {
  const normalized = normalize(input);
  const suggestions: StationSuggestion[] = [];
  const seen = new Set<string>();

  // Use length-based filtering for better performance
  const candidates = getCandidatesByLength(normalized.length, MATCHER_CONFIG.SUGGESTION_THRESHOLD);

  for (const { key, korean } of candidates) {
    if (seen.has(korean)) continue;

    const dist = levenshteinDistance(normalized, key, MATCHER_CONFIG.SUGGESTION_THRESHOLD);
    if (dist <= MATCHER_CONFIG.SUGGESTION_THRESHOLD) {
      suggestions.push({
        korean,
        english: koreanToEnglishMap.get(korean),
        distance: dist,
      });
      seen.add(korean);
    }
  }

  // Also check entries that might not be in length range for exact substring matches
  for (const [key, korean] of normalizedMap) {
    if (seen.has(korean)) continue;

    const dist = levenshteinDistance(normalized, key, MATCHER_CONFIG.SUGGESTION_THRESHOLD);
    if (dist <= MATCHER_CONFIG.SUGGESTION_THRESHOLD) {
      suggestions.push({
        korean,
        english: koreanToEnglishMap.get(korean),
        distance: dist,
      });
      seen.add(korean);
    }
  }

  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/**
 * Suggest similar station names for typos using Levenshtein distance
 * @param input - Misspelled station name
 * @param limit - Maximum number of suggestions
 * @returns Array of Korean station name suggestions (backward compatible)
 */
export function suggestStations(input: string, limit: number = MATCHER_CONFIG.DEFAULT_SUGGESTION_LIMIT): string[] {
  return suggestStationsEnhanced(input, limit).map(s => s.korean);
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
        (curr[i - 1] ?? 0) + 1,      // insertion
        (prev[i] ?? 0) + 1,          // deletion
        (prev[i - 1] ?? 0) + cost    // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[a.length] ?? 0;
}

/**
 * Get English name for a Korean station
 * @param korean - Korean station name
 * @returns English station name or undefined if not found
 */
export function getEnglishName(korean: string): string | undefined {
  return koreanToEnglishMap.get(korean);
}

/**
 * Clear all caches (for testing)
 */
export function clearCaches(): void {
  normalizeCache.clear();
  matchStationCache.clear();
}
