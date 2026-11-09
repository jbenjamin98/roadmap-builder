import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatBytes, slugifyName } from './download';

describe('download utils', () => {
  describe('slugifyName', () => {
    it('creates URL-friendly slugs', () => {
      expect(slugifyName('My Q1 2026 Roadmap!')).toBe('my-q1-2026-roadmap');
      expect(slugifyName('')).toBe('roadmap');
      expect(slugifyName(null)).toBe('roadmap');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes, KB, and MB correctly', () => {
      expect(formatBytes(0)).toBe('');
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(2048)).toBe('2.0 KB');
      expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });
  });

  describe('formatRelativeTime', () => {
    const NOW = 1762630000000;

    it('handles numeric ms timestamps', () => {
      expect(formatRelativeTime(NOW - 10000, NOW)).toBe('just now');
      expect(formatRelativeTime(NOW - 120000, NOW)).toBe('2 min ago');
      expect(formatRelativeTime(NOW - 7200000, NOW)).toBe('2 hr ago');
      expect(formatRelativeTime(NOW - 86400000 * 3, NOW)).toBe('3 days ago');
      expect(formatRelativeTime(NOW - 86400000, NOW)).toBe('1 day ago');
    });

    it('handles ISO 8601 string dates without returning NaN', () => {
      const iso5MinAgo = new Date(NOW - 300000).toISOString();
      expect(formatRelativeTime(iso5MinAgo, NOW)).toBe('5 min ago');

      const iso2DaysAgo = new Date(NOW - 86400000 * 2).toISOString();
      expect(formatRelativeTime(iso2DaysAgo, NOW)).toBe('2 days ago');
    });

    it('handles Date instances', () => {
      const dateInstance = new Date(NOW - 3600000);
      expect(formatRelativeTime(dateInstance, NOW)).toBe('1 hr ago');
    });

    it('safely handles missing, invalid or corrupt inputs', () => {
      expect(formatRelativeTime(null)).toBe('never');
      expect(formatRelativeTime(undefined)).toBe('never');
      expect(formatRelativeTime('not-a-valid-date')).toBe('never');
    });
  });
});
