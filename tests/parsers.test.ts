import { describe, it, expect } from 'vitest';

function parseFallbackAmount(text: string): number {
  if (!text) return 1000;

  // Check k notation (e.g., 20k -> 20000)
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // Check thousand/tousan/tousand
  const thousandMatch = text.match(/(\d+|five|ten|fifteen|twenty|fifty|hundred)\s*(?:thousand|tousan|tousand|handred)\b/i);
  if (thousandMatch) {
    const valStr = thousandMatch[1].toLowerCase();
    const wordMap: Record<string, number> = {
      five: 5000,
      ten: 10000,
      fifteen: 15000,
      twenty: 20000,
      fifty: 50000,
      hundred: 100000,
    };
    if (wordMap[valStr]) return wordMap[valStr];
    if (!isNaN(Number(valStr))) return Number(valStr) * 1000;
  }

  // Extract plain numbers
  const clean = text.replace(/,/g, '');
  const numberMatches = clean.match(/\d+(?:\.\d+)?/g);
  if (numberMatches && numberMatches.length > 0) {
    const sorted = numberMatches.map(Number).sort((a, b) => b - a);
    return sorted[0];
  }

  return 1500;
}

describe('AI & Offline Fallback Voice/SMS Parser Tests', () => {
  it('should correctly parse k notation (e.g. 20k -> 20000)', () => {
    expect(parseFallbackAmount('Client paid 20k for fabric')).toBe(20000);
    expect(parseFallbackAmount('Spent 2.5k on lunch')).toBe(2500);
  });

  it('should correctly parse Nigerian Pidgin "tousan" and word numbers', () => {
    expect(parseFallbackAmount('Spent fifteen tousan for generator fuel')).toBe(15000);
    expect(parseFallbackAmount('Paid five thousand for transport')).toBe(5000);
  });

  it('should correctly extract maximum numeric amount from SMS text', () => {
    expect(parseFallbackAmount('Acct: **2341 Amt: NGN12,500.00 DR Desc: POS')).toBe(12500);
    expect(parseFallbackAmount('Credit Alert! NGN 120,000.00 credited')).toBe(120000);
  });

  it('should return default fallback amount if no number found', () => {
    expect(parseFallbackAmount('I bought some bread')).toBe(1500);
  });
});
