import { describe, it, expect } from 'vitest';
import { translations } from './i18n';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const full = prefix ? `${prefix}.${k}` : k;
    return v !== null && typeof v === 'object'
      ? collectKeys(v as Record<string, unknown>, full)
      : [full];
  });
}

describe('i18n translations', () => {
  const enKeys = collectKeys(translations.en as unknown as Record<string, unknown>).sort();
  const thKeys = collectKeys(translations.th as unknown as Record<string, unknown>).sort();

  it('EN and TH have the same number of keys', () => {
    expect(thKeys.length).toBe(enKeys.length);
  });

  it('every EN key exists in TH', () => {
    const missingInTh = enKeys.filter(k => !thKeys.includes(k));
    expect(missingInTh).toEqual([]);
  });

  it('every TH key exists in EN', () => {
    const missingInEn = thKeys.filter(k => !enKeys.includes(k));
    expect(missingInEn).toEqual([]);
  });
});
