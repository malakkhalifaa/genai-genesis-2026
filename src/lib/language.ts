/**
 * Script-based language detection without external dependencies.
 * Uses Unicode character ranges to identify the primary script of a text sample.
 */

export type DetectedLang = 'zh' | 'ar' | 'hi' | 'ru' | 'ja' | 'ko' | 'pa' | 'en'

const LANG_NAMES: Record<string, string> = {
  zh: 'Chinese',  ar: 'Arabic',   hi: 'Hindi',
  ru: 'Russian',  ja: 'Japanese', ko: 'Korean',
  pa: 'Punjabi',  en: 'English',
}

/**
 * Detect the primary language/script of a text string.
 * Returns an ISO 639-1 code or 'en' as default.
 */
export function detectLanguage(text: string): DetectedLang {
  const sample = text.slice(0, 800)

  // Japanese: hiragana or katakana (often mixed with CJK)
  if (/[\u3040-\u30FF]/.test(sample)) return 'ja'

  // CJK unified ideographs (Chinese — after ruling out Japanese)
  if (/[\u4E00-\u9FFF]/.test(sample)) return 'zh'

  // Korean hangul
  if (/[\uAC00-\uD7AF]/.test(sample)) return 'ko'

  // Arabic
  if (/[\u0600-\u06FF]/.test(sample)) return 'ar'

  // Gurmukhi script (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(sample)) return 'pa'

  // Devanagari (Hindi, Marathi, Nepali …)
  if (/[\u0900-\u097F]/.test(sample)) return 'hi'

  // Cyrillic (Russian, Ukrainian, Bulgarian …)
  if (/[\u0400-\u04FF]/.test(sample)) return 'ru'

  return 'en'
}

export function getLanguageName(code: string): string {
  return LANG_NAMES[code] ?? code
}

/**
 * Build the bilingual instruction to append to the LLM prompt when the
 * input language differs from the UI language (English).
 */
export function buildBilingualInstruction(detectedLang: DetectedLang): string {
  if (detectedLang === 'en') return ''
  const name = getLanguageName(detectedLang)
  return (
    `\n\nThe content above appears to be written in ${name}. ` +
    `Provide the "explanation" field in BOTH ${name} AND English, ` +
    `formatted as:\n` +
    `[${name}]: <explanation in ${name}>\n` +
    `[English]: <explanation in English>\n` +
    `Keep "recommendedAction" in English only.`
  )
}
