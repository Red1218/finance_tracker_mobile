import { describe, it, expect } from 'vitest';
import { theme } from '../../../../shared/theme/theme';

import { vi } from 'vitest';
vi.mock('@/src/shared/theme', () => ({ useTheme: () => theme }));

import { TransactionDateGroup } from '../components/TransactionDateGroup';

function flattenStyle(style: any): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean).map(flattenStyle)) : style || {};
}

describe('TransactionDateGroup', () => {
  it('renders only the date label when no total is given', () => {
    const element: any = TransactionDateGroup({ dateLabel: 'TODAY · 24 AUGUST' });
    const [labelText, totalNode] = element.props.children;

    expect(labelText.props.children).toBe('TODAY · 24 AUGUST');
    expect(totalNode).toBeNull();
  });

  it('renders the running total alongside the date label when given', () => {
    const element: any = TransactionDateGroup({ dateLabel: 'TODAY · 24 AUGUST', totalLabel: '-₹1,080.00' });
    const [labelText, totalText] = element.props.children;

    expect(labelText.props.children).toBe('TODAY · 24 AUGUST');
    expect(totalText.props.children).toBe('-₹1,080.00');
    expect(totalText.props.accessibilityLabel).toBe('Total -₹1,080.00');
  });

  it('lays the label and total out on opposite ends of the row', () => {
    const element: any = TransactionDateGroup({ dateLabel: 'TODAY', totalLabel: '-₹1,080.00' });
    const containerStyle = flattenStyle(element.props.style);

    expect(containerStyle.flexDirection).toBe('row');
    expect(containerStyle.justifyContent).toBe('space-between');
  });

  it('gives the total tabular numerals so amounts align down a list', () => {
    const element: any = TransactionDateGroup({ dateLabel: 'TODAY', totalLabel: '-₹1,080.00' });
    const [, totalText] = element.props.children;

    expect(flattenStyle(totalText.props.style).fontVariant).toEqual(['tabular-nums']);
  });
});
