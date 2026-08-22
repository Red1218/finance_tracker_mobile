import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUpcomingBillsUseCase } from '../use-cases/GetUpcomingBillsUseCase';
import { IBillRepository } from '../ports/IBillRepository';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { Bill, BillId, BillName, BillAmount, BillDueDate, RecurrenceRule, CurrencyCode, RecurrenceType } from '../../domain';
import { BillApplicationError } from '../errors/BillApplicationError';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../categories/domain';
import { RepositoryError } from '../../../../platform/persistence';

describe('GetUpcomingBillsUseCase', () => {
  let mockBillRepo: IBillRepository;
  let mockCategoryRepo: ICategoryRepository;

  const asOf = new Date('2026-08-21T00:00:00.000Z');

  const createTestBill = (
    id: string,
    name: string,
    dueDateStr: string,
    amount: number = 1000,
    categoryId: string | null = null,
    recurrenceType: RecurrenceType = 'MONTHLY',
    isArchived: boolean = false
  ): Bill => {
    let bill = new Bill({
      id: new BillId(id),
      userId: 'user-123',
      name: new BillName(name),
      amount: new BillAmount(amount, new CurrencyCode('INR')),
      categoryId,
      recurrence: new RecurrenceRule(recurrenceType, 15),
      nextDueDate: new BillDueDate(new Date(dueDateStr)),
    });

    if (isArchived) {
      bill = bill.archive(new Date('2026-08-01T00:00:00.000Z'));
    }

    return bill;
  };

  beforeEach(() => {
    mockBillRepo = {
      findById: vi.fn(),
      findUpcoming: vi.fn(),
      save: vi.fn(),
      savePaymentAndBill: vi.fn(),
    };

    mockCategoryRepo = {
      getById: vi.fn(),
      list: vi.fn(),
      getAll: vi.fn(),
      save: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      restore: vi.fn(),
      existsByName: vi.fn(),
      existsByNameAndKind: vi.fn(),
    };
  });

  it('returns upcoming bills within default 30-day window', async () => {
    const bill1 = createTestBill('bill-1', 'Water Bill', '2026-08-25T00:00:00.000Z');
    const bill2 = createTestBill('bill-2', 'Internet', '2026-09-05T00:00:00.000Z');

    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({
      success: true,
      data: [bill1, bill2],
    });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    const dtos = await useCase.execute({ userId: 'user-123', asOfDate: asOf });

    expect(mockBillRepo.findUpcoming).toHaveBeenCalledWith('user-123', 30, asOf);
    expect(dtos).toHaveLength(2);
    expect(dtos[0].billName).toBe('Water Bill');
    expect(dtos[1].billName).toBe('Internet');
  });

  it('uses default 30-day window when windowDays is omitted', async () => {
    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({ success: true, data: [] });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    await useCase.execute({ userId: 'user-123', asOfDate: asOf });

    expect(mockBillRepo.findUpcoming).toHaveBeenCalledWith('user-123', 30, asOf);
  });

  it('includes overdue bills and assigns critical urgency', async () => {
    const overdueBill = createTestBill('bill-overdue', 'Electricity', '2026-08-18T00:00:00.000Z');

    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({
      success: true,
      data: [overdueBill],
    });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    const dtos = await useCase.execute({ userId: 'user-123', asOfDate: asOf });

    expect(dtos).toHaveLength(1);
    expect(dtos[0].status).toBe('Overdue');
    expect(dtos[0].urgency).toBe('critical');
    expect(dtos[0].dueDateLabel).toBe('Overdue by 3 days');
  });

  it('excludes archived bills from results', async () => {
    const activeBill = createTestBill('bill-1', 'Active', '2026-08-25T00:00:00.000Z');
    const archivedBill = createTestBill('bill-2', 'Archived', '2026-08-22T00:00:00.000Z', 1000, null, 'MONTHLY', true);

    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({
      success: true,
      data: [activeBill, archivedBill],
    });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    const dtos = await useCase.execute({ userId: 'user-123', asOfDate: asOf });

    expect(dtos).toHaveLength(1);
    expect(dtos[0].billName).toBe('Active');
  });

  it('assigns correct status and urgency for DueToday, <=3 days, 4-14 days, and 15-30 days', async () => {
    const dueToday = createTestBill('b1', 'Today', '2026-08-21T00:00:00.000Z');
    const dueIn2 = createTestBill('b2', 'In 2 Days', '2026-08-23T00:00:00.000Z');
    const dueIn7 = createTestBill('b3', 'In 7 Days', '2026-08-28T00:00:00.000Z');
    const dueIn20 = createTestBill('b4', 'In 20 Days', '2026-09-10T00:00:00.000Z');

    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({
      success: true,
      data: [dueToday, dueIn2, dueIn7, dueIn20],
    });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    const dtos = await useCase.execute({ userId: 'user-123', asOfDate: asOf });

    expect(dtos[0].status).toBe('DueToday');
    expect(dtos[0].urgency).toBe('high');
    expect(dtos[0].dueDateLabel).toBe('Due Today');

    expect(dtos[1].status).toBe('Upcoming');
    expect(dtos[1].urgency).toBe('high');

    expect(dtos[2].status).toBe('Upcoming');
    expect(dtos[2].urgency).toBe('medium');

    expect(dtos[3].status).toBe('Upcoming');
    expect(dtos[3].urgency).toBe('low');
  });

  it('sorts DTOs chronologically by nextDueDate ASC', async () => {
    const laterBill = createTestBill('b-later', 'Later', '2026-09-01T00:00:00.000Z');
    const earlierBill = createTestBill('b-earlier', 'Earlier', '2026-08-22T00:00:00.000Z');

    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({
      success: true,
      data: [laterBill, earlierBill],
    });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    const dtos = await useCase.execute({ userId: 'user-123', asOfDate: asOf });

    expect(dtos[0].billName).toBe('Earlier');
    expect(dtos[1].billName).toBe('Later');
  });

  it('resolves categoryName via ICategoryRepository if provided', async () => {
    const catBill = createTestBill('b-cat', 'Utilities', '2026-08-25T00:00:00.000Z', 1000, 'cat-uuid-1');

    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({
      success: true,
      data: [catBill],
    });

    vi.mocked(mockCategoryRepo.getById).mockResolvedValue({
      success: true,
      data: new Category({
        id: new CategoryId('cat-uuid-1'),
        name: new CategoryName('Bills & Utilities'),
        kind: CategoryKind.Expense,
        isSystem: false,
      }),
    });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo, mockCategoryRepo);
    const dtos = await useCase.execute({ userId: 'user-123', asOfDate: asOf });

    expect(dtos[0].categoryName).toBe('Bills & Utilities');
  });

  it('throws BillApplicationError(REPOSITORY_ERROR) on repository failure', async () => {
    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({
      success: false,
      error: new RepositoryError('CONNECTION_FAILED', 'Database connection timeout'),
    });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    await expect(useCase.execute({ userId: 'user-123' })).rejects.toThrow(BillApplicationError);
  });

  it('supports explicit custom windowDays', async () => {
    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({ success: true, data: [] });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    await useCase.execute({ userId: 'user-123', windowDays: 14, asOfDate: asOf });

    expect(mockBillRepo.findUpcoming).toHaveBeenCalledWith('user-123', 14, asOf);
  });

  it('remains period-independent (does not depend on reporting period)', async () => {
    const bill = createTestBill('b1', 'Rent', '2026-09-01T00:00:00.000Z');
    vi.mocked(mockBillRepo.findUpcoming).mockResolvedValue({ success: true, data: [bill] });

    const useCase = new GetUpcomingBillsUseCase(mockBillRepo);
    const dtos = await useCase.execute({ userId: 'user-123', asOfDate: asOf });

    expect(dtos).toHaveLength(1);
    expect(dtos[0].billName).toBe('Rent');
  });
});
