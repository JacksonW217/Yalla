import { describe, expect, it } from 'vitest';
import { hasArabic, normalizeArabic, sameArabic } from './typing';

describe('typing check', () => {
  it('ignores vowel marks, hamza seats, punctuation and spacing', () => {
    expect(sameArabic('كتاب', 'كِتَاب')).toBe(true);
    expect(sameArabic('اهلا', 'أهلاً')).toBe(true);
    expect(sameArabic(' ازيك ', 'إزيك؟')).toBe(true);
    expect(sameArabic('صباح  الخير', 'صباح الخير')).toBe(true);
    expect(sameArabic('انتى', 'إنتي')).toBe(true);
  });

  it('is strict about the letters themselves', () => {
    expect(sameArabic('كتب', 'كتاب')).toBe(false);
    expect(sameArabic('ت', 'ب')).toBe(false);
    expect(sameArabic('مدرسه', 'مدرسة')).toBe(false);
    expect(sameArabic('kitaab', 'كتاب')).toBe(false);
    expect(sameArabic('', 'ب')).toBe(false);
  });

  it('detects Arabic input', () => {
    expect(hasArabic('ب')).toBe(true);
    expect(hasArabic('b')).toBe(false);
    expect(normalizeArabic('بَـيْت')).toBe('بيت');
  });
});
