import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

import { KPICardViewModel } from '../../../application/view-models/KPICardViewModel';
import { IncomeExpenseSection } from '../../components/sections/IncomeExpenseSection';

function collectNodes(node: any, predicate: (n: any) => boolean, out: any[] = []): any[] {
  if (node === null || node === undefined) return out;
  if (predicate(node)) out.push(node);
  if (typeof node !== 'object') return out;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    children.forEach((c) => collectNodes(c, predicate, out));
  } else if (children !== undefined && children !== null) {
    collectNodes(children, predicate, out);
  }
  return out;
}

function collectTexts(node: any): string[] {
  return collectNodes(node, (n) => typeof n === 'string');
}

describe('IncomeExpenseSection Component Presentation', () => {
  const loadedViewModel: KPICardViewModel = {
    sectionType: 'KPI',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: {
      totalBalance: '₹50,000.00',
      periodIncome: '₹62,000.00',
      periodExpenses: '₹38,580.00',
      netForPeriod: '₹23,420.00',
      incomeTrend: { direction: 'Neutral', label: '0%', accessibilityLabel: '0%' },
      expenseTrend: { direction: 'Neutral', label: '0%', accessibilityLabel: '0%' },
    },
  };

  it('renders Income and Expenses as two unboxed tiles, no net-balance hero', () => {
    const element = IncomeExpenseSection({ viewModel: loadedViewModel, onRetry: vi.fn() });

    expect(element.type.name).toBe('SectionStateContainer');
    expect(element.props.status).toBe('Loaded');

    const texts = collectTexts(element);
    expect(texts).toContain('Income');
    expect(texts).toContain('₹62,000.00');
    expect(texts).toContain('Expenses');
    expect(texts).toContain('₹38,580.00');
    expect(texts).not.toContain('NET BALANCE');
    expect(texts).not.toContain('₹50,000.00');
  });

  it('falls back to ₹0.00 for either figure when content is absent', () => {
    const emptyContentViewModel: KPICardViewModel = {
      ...loadedViewModel,
      content: null as any,
    };

    const element = IncomeExpenseSection({ viewModel: emptyContentViewModel, onRetry: vi.fn() });
    const texts = collectTexts(element);
    expect(texts.filter((t) => t === '₹0.00')).toHaveLength(2);
  });

  it('passes error state and onRetry callback to SectionStateContainer', () => {
    const onRetryMock = vi.fn();
    const errorViewModel: KPICardViewModel = {
      ...loadedViewModel,
      status: 'Error',
      error: 'Failed to load income and expenses',
      content: null as any,
    };

    const element = IncomeExpenseSection({ viewModel: errorViewModel, onRetry: onRetryMock });
    expect(element.props.status).toBe('Error');
    expect(element.props.errorMessage).toBe('Failed to load income and expenses');

    element.props.onRetry();
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
