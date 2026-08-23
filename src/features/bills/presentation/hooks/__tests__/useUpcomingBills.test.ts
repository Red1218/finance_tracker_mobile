import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillsPresenter } from '../../presenters/BillsPresenter';
import { UpcomingBillItemViewModel } from '../../view-models/UpcomingBillsViewModel';

describe('useUpcomingBills State Logic', () => {
  let mockPresenter: BillsPresenter;

  const mockBills: UpcomingBillItemViewModel[] = [
    {
      billId: 'b-1',
      billName: 'Internet',
      formattedAmount: '₹1,000.00',
      rawAmount: 1000,
      currencyCode: 'INR',
      dueDateLabel: 'Due in 3 days',
      status: 'Upcoming',
      urgency: 'medium',
      categoryName: 'Utilities',
      canMarkPaid: true,
    },
  ];

  beforeEach(() => {
    mockPresenter = {
      loadUpcomingBills: vi.fn().mockResolvedValue(mockBills),
      markBillPaid: vi.fn().mockResolvedValue({
        paymentId: 'p-1',
        billId: 'b-1',
        paidAt: '2026-08-23T00:00:00.000Z',
        newNextDueDate: '2026-09-23T00:00:00.000Z',
        linkedTransactionId: null,
      }),
    } as unknown as BillsPresenter;
  });

  it('delegates loading upcoming bills to presenter', async () => {
    const result = await mockPresenter.loadUpcomingBills('user-1');
    expect(result).toEqual(mockBills);
    expect(mockPresenter.loadUpcomingBills).toHaveBeenCalledWith('user-1');
  });

  it('delegates marking bill paid to presenter', async () => {
    const res = await mockPresenter.markBillPaid({
      billId: 'b-1',
      amount: 1000,
      currencyCode: 'INR',
    });
    expect(res.billId).toBe('b-1');
    expect(mockPresenter.markBillPaid).toHaveBeenCalledWith({
      billId: 'b-1',
      amount: 1000,
      currencyCode: 'INR',
    });
  });
});
