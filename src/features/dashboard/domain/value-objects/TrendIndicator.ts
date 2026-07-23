export type TrendDirection = 'UP' | 'DOWN' | 'UNCHANGED';

export class TrendIndicator {
  constructor(
    public readonly direction: TrendDirection,
    public readonly percentageChange: number
  ) {
    if (direction === 'UNCHANGED' && percentageChange !== 0) {
      throw new Error('UNCHANGED direction must have 0 percentage change');
    }
    if (direction !== 'UNCHANGED' && percentageChange === 0) {
      throw new Error('Direction cannot be UP or DOWN with 0 percentage change');
    }
  }

  static neutral(): TrendIndicator {
    return new TrendIndicator('UNCHANGED', 0);
  }

  static calculate(current: number, previous: number | null): TrendIndicator {
    if (previous === null) {
      return TrendIndicator.neutral();
    }
    
    if (previous === 0) {
      if (current === 0) return TrendIndicator.neutral();
      return new TrendIndicator(current > 0 ? 'UP' : 'DOWN', 100);
    }
    
    const change = ((current - previous) / Math.abs(previous)) * 100;
    
    if (change === 0) return TrendIndicator.neutral();
    
    return new TrendIndicator(
      change > 0 ? 'UP' : 'DOWN',
      change
    );
  }
}
