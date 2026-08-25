import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

vi.mock('@react-native-community/datetimepicker', () => ({
  default: () => null,
}));

vi.mock('../../components/charts/TrendLineChart', () => ({
  TrendLineChart: () => null,
}));

vi.mock('../../components/charts/CategoryDonutChart', () => ({
  CategoryDonutChart: () => null,
}));

vi.mock('../../components/charts/BudgetBarChart', () => ({
  BudgetBarChart: () => null,
}));

vi.mock('../../hooks/useReporting', () => ({
  useReporting: () => ({
    selectedPeriod: 'MONTH',
    viewModel: {
      selectedPeriod: 'MONTH',
      financialSummary: {
        formattedIncome: '₹60,000.00',
        formattedExpense: '₹20,000.00',
        formattedNetSavings: '₹40,000.00',
        savingsRatePercentage: 66.7,
        isPositiveSavings: true,
      },
      categoryBreakdown: [],
      monthlyTrend: [],
    },
    isLoading: false,
    error: null,
    changePeriod: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: (initial: any) => [typeof initial === 'function' ? initial() : initial, vi.fn()],
  };
});

import { ReportingScreen } from '../../screens/ReportingScreen';

describe('ReportingScreen Component Presentation', () => {
  it('renders screen container with header title, refresh action, and content cards', () => {
    const element = ReportingScreen({}) as React.ReactElement<{
      style?: Array<{ backgroundColor?: string }>;
      children?: Array<React.ReactElement<{
        style?: Array<{ paddingHorizontal?: number; paddingTop?: number }>;
        children?: Array<React.ReactElement<{
          children?: Array<React.ReactElement<{
            children?: string;
            accessibilityLabel?: string;
          }>>;
        }>>;
        contentContainerStyle?: { padding?: number };
      }>>;
    }>;

    expect(element.props.style?.[1]?.backgroundColor).toBe(theme.colors.backgroundPrimary);

    const header = element.props.children?.[0];
    const headerTop = header?.props?.children?.[0];
    const titleText = headerTop?.props?.children?.[0];
    expect(titleText?.props?.children).toBe('Analytics & Reporting');

    const scrollContent = element.props.children?.[1];
    expect(scrollContent?.props?.contentContainerStyle?.padding).toBe(16);
  });
});
