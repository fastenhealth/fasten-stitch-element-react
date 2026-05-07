import { describe, it, expect } from 'vitest';
import { Base64UrlEncode, Base64UrlDecode } from './base64';

describe('Base64UrlEncode', () => {
  it('encodes a simple string', () => {
    const result = Base64UrlEncode('hello');
    // Standard base64 of "hello" is "aGVsbG8=", URL-safe strips "="
    expect(result).toBe('aGVsbG8');
  });

  it('replaces + with - and / with _', () => {
    // "?>>>" in standard base64 is "Pz4+Pg==" which contains + and /
    // Let's use a known string that produces + or /
    // "subjects?_d" → base64 "c3ViamVjdHM/X2Q=" → has / in it
    const result = Base64UrlEncode('subjects?_d');
    expect(result).not.toContain('+');
    expect(result).not.toContain('/');
    expect(result).not.toContain('=');
  });

  it('strips trailing = padding', () => {
    // "a" → base64 "YQ==" (has padding)
    const result = Base64UrlEncode('a');
    expect(result).toBe('YQ');
    expect(result).not.toContain('=');
  });

  it('handles empty string', () => {
    const result = Base64UrlEncode('');
    expect(result).toBe('');
  });

  it('handles strings with special characters', () => {
    const input = '{"key": "value", "nested": true}';
    const encoded = Base64UrlEncode(input);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });
});

describe('Base64UrlDecode', () => {
  it('decodes a simple string', () => {
    const result = Base64UrlDecode('aGVsbG8');
    expect(result).toBe('hello');
  });

  it('restores - to + and _ to /', () => {
    // Encode then decode should round-trip
    const original = 'subjects?_d';
    const encoded = Base64UrlEncode(original);
    const decoded = Base64UrlDecode(encoded);
    expect(decoded).toBe(original);
  });

  it('handles strings that need padding restoration', () => {
    // "YQ" needs "==" padding to decode to "a"
    const result = Base64UrlDecode('YQ');
    expect(result).toBe('a');
  });

  it('handles empty string', () => {
    const result = Base64UrlDecode('');
    expect(result).toBe('');
  });

  it('round-trips JSON content', () => {
    const original = '{"key": "value", "count": 42}';
    const encoded = Base64UrlEncode(original);
    const decoded = Base64UrlDecode(encoded);
    expect(decoded).toBe(original);
  });

  it('round-trips strings of various lengths (padding edge cases)', () => {
    // length 1 → 2 padding chars, length 2 → 1 padding char, length 3 → 0
    for (const s of ['a', 'ab', 'abc', 'abcd', 'abcde']) {
      expect(Base64UrlDecode(Base64UrlEncode(s))).toBe(s);
    }
  });
});
