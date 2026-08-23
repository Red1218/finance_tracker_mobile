import { describe, it, expect, vi } from 'vitest';
import { UpcomingBillsSectionProps } from '../UpcomingBillsSection';
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
});
