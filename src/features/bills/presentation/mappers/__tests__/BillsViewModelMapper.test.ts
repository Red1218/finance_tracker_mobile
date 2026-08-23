import { describe, it, expect } from 'vitest';
import { BillsViewModelMapper, formatCurrency } from '../BillsViewModelMapper';
import { UpcomingBillDTO } from '../../../application/dto/UpcomingBillDTO';

describe('BillsViewModelMapper', () => {
  it('formats currency correctly with symbol', () => {
    expect(formatCurrency(1500, 'INR')).toBe('₹1,500.00');
    expect(formatCurrency(250.5, 'USD')).toBe('$250.50');
    expect(formatCurrency(100, 'EUR')).toBe('€100.00');
    expect(formatCurrency(50, 'XYZ')).toBe('XYZ 50.00');
  });

  it('maps UpcomingBillDTO to UpcomingBillItemViewModel accurately', () => {
    const dto: UpcomingBillDTO = {
      billId: 'bill-123',
      billName: 'Internet Subscription',
      amount: 1200,
      currencyCode: 'INR',
      nextDueDate: '2026-09-01T00:00:00.000Z',
      dueDateLabel: 'Due in 5 days',
      status: 'Upcoming',
      urgency: 'medium',
      categoryId: 'cat-wifi',
      categoryName: 'Utilities',
      recurrenceType: 'MONTHLY',
    };

    const vm = BillsViewModelMapper.toItemViewModel(dto);

    expect(vm).toEqual({
      billId: 'bill-123',
      billName: 'Internet Subscription',
      formattedAmount: '₹1,200.00',
      rawAmount: 1200,
      currencyCode: 'INR',
      dueDateLabel: 'Due in 5 days',
      status: 'Upcoming',
      urgency: 'medium',
      categoryName: 'Utilities',
      canMarkPaid: true,
    });
  });

  it('maps list of DTOs', () => {
    const dtos: UpcomingBillDTO[] = [
      {
        billId: 'b-1',
        billName: 'Rent',
        amount: 25000,
        currencyCode: 'INR',
        nextDueDate: '2026-08-25T00:00:00.000Z',
        dueDateLabel: 'Tomorrow',
        status: 'DueToday',
        urgency: 'high',
        categoryId: null,
        categoryName: null,
        recurrenceType: 'MONTHLY',
      },
    ];

    const list = BillsViewModelMapper.toItemViewModelList(dtos);
    expect(list).toHaveLength(1);
    expect(list[0].billName).toBe('Rent');
    expect(list[0].formattedAmount).toBe('₹25,000.00');
  });
});
