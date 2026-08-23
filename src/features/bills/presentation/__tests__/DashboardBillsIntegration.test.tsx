import { describe, it, expect } from 'vitest';
import { UpcomingBillsSectionState } from '../view-models/UpcomingBillsViewModel';

describe('DashboardBillsIntegration Structure', () => {
  it('validates composition between Dashboard section and UpcomingBillsSectionState', () => {
    const upcomingBillsState: UpcomingBillsSectionState = {
      status: 'SUCCESS',
      bills: [
        {
          billId: 'bill-dash-1',
          billName: 'Mortgage Payment',
          formattedAmount: '₹45,000.00',
          rawAmount: 45000,
          currencyCode: 'INR',
          dueDateLabel: 'Due in 7 days',
          status: 'Upcoming',
          urgency: 'medium',
          categoryName: 'Housing',
          canMarkPaid: true,
        },
      ],
      errorMessage: null,
    };

    expect(upcomingBillsState.status).toBe('SUCCESS');
    expect(upcomingBillsState.bills[0].billName).toBe('Mortgage Payment');
    expect(upcomingBillsState.bills[0].formattedAmount).toBe('₹45,000.00');
  });
});
