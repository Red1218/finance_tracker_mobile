import { describe, it, expect } from 'vitest';
import { withAlpha } from '../withAlpha';

describe('withAlpha', () => {
  it('converts a 6-digit hex color to an rgba string at the given alpha', () => {
    expect(withAlpha('#9184D9', 0.15)).toBe('rgba(145, 132, 217, 0.15)');
  });

  it('converts a 3-digit hex color by expanding each digit', () => {
    expect(withAlpha('#fff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('handles lowercase hex digits', () => {
    expect(withAlpha('#cf6968', 0.12)).toBe('rgba(207, 105, 104, 0.12)');
  });

  it('handles a hex value without a leading #', () => {
    expect(withAlpha('61B990', 0.12)).toBe('rgba(97, 185, 144, 0.12)');
  });
});
