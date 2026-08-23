import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillsPresenter, DEFAULT_DASHBOARD_UPCOMING_BILLS_WINDOW_DAYS } from '../BillsPresenter';
import { GetUpcomingBillsUseCase, MarkBillPaidUseCase, UpcomingBillDTO } from '../../../application';

describe('BillsPresenter', () => {
  let mockGetUpcomingUseCase: GetUpcomingBillsUseCase;
  let mockMarkPaidUseCase: MarkBillPaidUseCase;
  let presenter: BillsPresenter;

  beforeEach(() => {
    mockGetUpcomingUseCase = {
      execute: vi.fn(),
    } as unknown as GetUpcomingBillsUseCase;

    mockMarkPaidUseCase = {
      execute: vi.fn(),
    } as unknown as MarkBillPaidUseCase;

    presenter = new BillsPresenter(mockGetUpcomingUseCase, mockMarkPaidUseCase);
  });

  describe('loadUpcomingBills', () => {
    it('calls GetUpcomingBillsUseCase with correct parameters and returns mapped view models', async () => {
      const mockDtos: UpcomingBillDTO[] = [
        {
          billId: 'b-100',
          billName: 'Electricity Bill',
          amount: 1500,
          currencyCode: 'INR',
          nextDueDate: '2026-08-25T00:00:00.000Z',
          dueDateLabel: 'In 2 days',
          status: 'Upcoming',
          urgency: 'high',
          categoryId: 'cat-1',
          categoryName: 'Utilities',
          recurrenceType: 'MONTHLY',
        },
      ];

      vi.mocked(mockGetUpcomingUseCase.execute).mockResolvedValueOnce(mockDtos);

      const result = await presenter.loadUpcomingBills('user-123', 30);

      expect(mockGetUpcomingUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        windowDays: 30,
      });

      expect(result).toHaveLength(1);
      expect(result[0].billId).toBe('b-100');
      expect(result[0].formattedAmount).toBe('₹1,500.00');
    });

    it('uses DEFAULT_DASHBOARD_UPCOMING_BILLS_WINDOW_DAYS if windowDays not supplied', async () => {
      vi.mocked(mockGetUpcomingUseCase.execute).mockResolvedValueOnce([]);

      await presenter.loadUpcomingBills('user-456');

      expect(mockGetUpcomingUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-456',
        windowDays: DEFAULT_DASHBOARD_UPCOMING_BILLS_WINDOW_DAYS,
      });
    });
  });

  describe('markBillPaid', () => {
    it('calls MarkBillPaidUseCase with default UNLINKED execution mode and returns result DTO', async () => {
      const mockResult = {
        paymentId: 'pay-001',
        billId: 'b-100',
        occurrenceKey: '2026-08-25',
        updatedNextDueDate: '2026-09-25T00:00:00.000Z',
        isArchived: false,
        linkedTransactionId: null,
      };

      vi.mocked(mockMarkPaidUseCase.execute).mockResolvedValueOnce(mockResult);

      const res = await presenter.markBillPaid({
        billId: 'b-100',
        amount: 1500,
        currencyCode: 'INR',
      });

      expect(mockMarkPaidUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          billId: 'b-100',
          amount: 1500,
          currencyCode: 'INR',
          executionMode: 'UNLINKED',
        })
      );
      expect(res).toEqual(mockResult);
    });
  });
});
