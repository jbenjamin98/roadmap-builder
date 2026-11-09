import { describe, expect, it } from 'vitest';
import { getContrastingBracketColor } from './styleHelpers';

describe('getContrastingBracketColor', () => {
  const tokens = {
    primary: '#6366f1',
    accents: ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'],
    isLight: false,
  };

  it('never returns the same color as the task bar', () => {
    const testBarColors = [
      '#6366f1', // Indigo
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#0f172a', // Dark slate
      '#ffffff', // White
      '#f43f5e', // Rose
    ];

    for (const barColor of testBarColors) {
      const bracketColor = getContrastingBracketColor(barColor, tokens);
      expect(bracketColor.toLowerCase()).not.toBe(barColor.toLowerCase());
      expect(bracketColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('selects high-visibility contrast on indigo bars', () => {
    const bracketColor = getContrastingBracketColor('#6366f1', tokens);
    // Amber provides maximum contrast against indigo
    expect(bracketColor).toBe('#f59e0b');
  });

  it('selects high-visibility contrast on amber bars', () => {
    const bracketColor = getContrastingBracketColor('#f59e0b', tokens);
    // Cyan or indigo provides high contrast against amber
    expect(['#06b6d4', '#6366f1']).toContain(bracketColor);
  });

  it('handles missing tokens gracefully', () => {
    const bracketColor = getContrastingBracketColor('#6366f1', null);
    expect(bracketColor).toBeDefined();
    expect(bracketColor).not.toBe('#6366f1');
  });
});
