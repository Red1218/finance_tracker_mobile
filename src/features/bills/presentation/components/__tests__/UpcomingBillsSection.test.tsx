import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

import { UpcomingBillsSection, UpcomingBillsSectionProps } from '../UpcomingBillsSection';
import { UpcomingBillsSectionState } from '../../view-models/UpcomingBillsViewModel';

describe('UpcomingBillsSection Component Structure', () => {
  it('instantiates UpcomingBillsSection props accurately', () => {
    const state: UpcomingBillsSectionState = {
      status: 'SUCCESS',
      bills: [
        {
          billId: 'b-1',
          billName: 'Water Bill',
          formattedAmount: '₹500.00',
          rawAmount: 500,
          currencyCode: 'INR',
          dueDateLabel: 'Due Today',
          status: 'DueToday',
          urgency: 'high',
          categoryName: 'Utilities',
        },
      ],
      errorMessage: null,
    };

    const props: UpcomingBillsSectionProps = {
      state,
      onRetry: vi.fn(),
    };

    expect(props.state.status).toBe('SUCCESS');
    expect(props.state.bills).toHaveLength(1);
    expect(props.state.bills[0].billName).toBe('Water Bill');
  });

  it('renders View All button when onViewAll callback is provided', () => {
    const onViewAllMock = vi.fn();
    const state: UpcomingBillsSectionState = {
      status: 'SUCCESS',
      bills: [],
      errorMessage: null,
    };

    const element = UpcomingBillsSection({
      state,
      onRetry: vi.fn(),
      onViewAll: onViewAllMock,
    });

    const header = element.props.children.props.children[0];
    const viewAllButton = header.props.children[1];
    expect(viewAllButton.props.accessibilityLabel).toBe('View all upcoming bills');

    viewAllButton.props.onPress();
    expect(onViewAllMock).toHaveBeenCalledTimes(1);
  });
});
