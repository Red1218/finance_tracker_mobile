import { describe, it, expect } from 'vitest';
import { BudgetCircularProgressProps } from '../components/BudgetCircularProgress';

describe('BudgetCircularProgress', () => {
  it('computes clamped percentage and stroke properties accurately', () => {
    const props: BudgetCircularProgressProps = {
      percentageUsed: 70,
      status: 'ON_TRACK',
      size: 120,
      strokeWidth: 10,
    };

    const radius = (props.size! - props.strokeWidth!) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPercentage = Math.min(Math.max(props.percentageUsed, 0), 100);
    const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

    expect(radius).toBe(55);
    expect(clampedPercentage).toBe(70);
    expect(strokeDashoffset).toBeCloseTo(circumference * 0.3);
  });

  it('clamps visual stroke when utilization exceeds 100%', () => {
    const props: BudgetCircularProgressProps = {
      percentageUsed: 125,
      status: 'OVER_BUDGET',
    };

    const clampedPercentage = Math.min(Math.max(props.percentageUsed, 0), 100);
    expect(clampedPercentage).toBe(100);
    expect(props.percentageUsed).toBe(125);
  });
});
