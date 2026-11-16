/**
 * Compare typed Arabic with the expected answer. Forgiving about things a
 * beginner shouldn't be marked down for (vowel marks, hamza on alif, final
 * ى vs ي, punctuation, spacing) and strict about the letters themselves.
 */
export function normalizeArabic(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[ً-ْٰـ‌‍]/g, '') // marks, tatweel, joiners
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[؟?!.,،؛:"'…]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const sameArabic = (typed: string, expected: string) => normalizeArabic(typed) === normalizeArabic(expected);

/** True if the text contains at least one Arabic letter. */
export const hasArabic = (s: string) => /[ء-ي]/.test(s);
