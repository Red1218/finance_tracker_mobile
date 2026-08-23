import { describe, it, expect, vi } from 'vitest';
import { UpcomingBillsCard, UpcomingBillsCardProps } from '../UpcomingBillsCard';
import { UpcomingBillItemViewModel } from '../../view-models/UpcomingBillsViewModel';

describe('UpcomingBillsCard Component Structure', () => {
  const sampleBill: UpcomingBillItemViewModel = {
    billId: 'bill-card-1',
    billName: 'Electricity Bill',
    formattedAmount: '₹1,500.00',
    rawAmount: 1500,
    currencyCode: 'INR',
    dueDateLabel: 'Due in 2 days',
    status: 'Upcoming',
    urgency: 'high',
    categoryName: 'Utilities',
  };

  it('instantiates UpcomingBillsCard component cleanly', () => {
    const props: UpcomingBillsCardProps = {
      bill: sampleBill,
      onMarkPaidPress: vi.fn(),
      onBillPress: vi.fn(),
    };
    expect(props.bill.billName).toBe('Electricity Bill');
    expect(props.bill.formattedAmount).toBe('₹1,500.00');
  });

  it('supports mark paid callback', () => {
    const onMarkPaidPress = vi.fn();
    onMarkPaidPress(sampleBill.billId);
    expect(onMarkPaidPress).toHaveBeenCalledWith('bill-card-1');
  });
});
