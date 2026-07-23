import { describe, it, expect } from 'vitest';
import { TrendIndicator } from '../../value-objects/TrendIndicator';

describe('TrendIndicator', () => {
  it('should construct correctly', () => {
    const trend = new TrendIndicator('UP', 10);
    expect(trend.direction).toBe('UP');
    expect(trend.percentageChange).toBe(10);
  });

  it('should throw if direction is UNCHANGED but percentage is not 0', () => {
    expect(() => new TrendIndicator('UNCHANGED', 5)).toThrow('UNCHANGED direction must have 0 percentage change');
  });

  it('should throw if direction is not UNCHANGED but percentage is 0', () => {
    expect(() => new TrendIndicator('UP', 0)).toThrow('Direction cannot be UP or DOWN with 0 percentage change');
    expect(() => new TrendIndicator('DOWN', 0)).toThrow('Direction cannot be UP or DOWN with 0 percentage change');
  });

  it('should create a neutral indicator', () => {
    const neutral = TrendIndicator.neutral();
    expect(neutral.direction).toBe('UNCHANGED');
    expect(neutral.percentageChange).toBe(0);
  });

  describe('calculate', () => {
    it('should return neutral if previous is null', () => {
      const result = TrendIndicator.calculate(100, null);
      expect(result.direction).toBe('UNCHANGED');
      expect(result.percentageChange).toBe(0);
    });

    it('should return neutral if previous and current are 0', () => {
      const result = TrendIndicator.calculate(0, 0);
      expect(result.direction).toBe('UNCHANGED');
      expect(result.percentageChange).toBe(0);
    });

    it('should return UP 100% if previous is 0 and current > 0', () => {
      const result = TrendIndicator.calculate(50, 0);
      expect(result.direction).toBe('UP');
      expect(result.percentageChange).toBe(100);
    });

    it('should calculate positive percentage change correctly', () => {
      const result = TrendIndicator.calculate(150, 100);
      expect(result.direction).toBe('UP');
      expect(result.percentageChange).toBe(50);
    });

    it('should calculate negative percentage change correctly', () => {
      const result = TrendIndicator.calculate(50, 100);
      expect(result.direction).toBe('DOWN');
      expect(result.percentageChange).toBe(-50);
    });

    it('should return neutral if change is 0', () => {
      const result = TrendIndicator.calculate(100, 100);
      expect(result.direction).toBe('UNCHANGED');
      expect(result.percentageChange).toBe(0);
    });
  });
});
