import { describe, it, expect, vi, Mock } from 'vitest';
import { BudgetController } from '../controllers/BudgetController';
import {
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  ArchiveBudgetUseCase,
  RestoreBudgetUseCase,
  ListBudgetsUseCase,
  GetBudgetSummaryUseCase,
} from '../../application';

interface MockUseCase {
  execute: Mock;
}

describe('BudgetController', () => {
  const mockCreateUseCase: MockUseCase = { execute: vi.fn() };
  const mockUpdateUseCase: MockUseCase = { execute: vi.fn() };
  const mockArchiveUseCase: MockUseCase = { execute: vi.fn() };
  const mockRestoreUseCase: MockUseCase = { execute: vi.fn() };
  const mockListUseCase: MockUseCase = { execute: vi.fn() };
  const mockSummaryUseCase: MockUseCase = { execute: vi.fn() };

  const controller = new BudgetController(
    mockCreateUseCase as unknown as CreateBudgetUseCase,
    mockUpdateUseCase as unknown as UpdateBudgetUseCase,
    mockArchiveUseCase as unknown as ArchiveBudgetUseCase,
    mockRestoreUseCase as unknown as RestoreBudgetUseCase,
    mockListUseCase as unknown as ListBudgetsUseCase,
    mockSummaryUseCase as unknown as GetBudgetSummaryUseCase
  );

  it('delegates createBudget call to createBudgetUseCase', async () => {
    const mockBudget = {
      id: 'b-101',
      categoryId: 'cat-1',
      isOverall: false,
      amount: 5000,
      currencyCode: 'INR',
      periodKind: 'MONTHLY',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      isArchived: false,
      archivedAt: null,
    };
    mockCreateUseCase.execute.mockResolvedValue(mockBudget);

    const command = {
      categoryId: 'cat-1',
      amount: 5000,
      currencyCode: 'INR',
      periodKind: 'MONTHLY' as const,
      startDate: new Date(),
      endDate: new Date(),
    };

    const result = await controller.createBudget(command);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(command);
    expect(result.id).toBe('b-101');
    expect(result.amount).toBe(5000);
  });

  it('delegates updateBudget call to updateBudgetUseCase', async () => {
    const mockBudget = {
      id: 'b-101',
      categoryId: null,
      isOverall: true,
      amount: 7500,
      currencyCode: 'INR',
      periodKind: 'MONTHLY',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      isArchived: false,
      archivedAt: null,
    };
    mockUpdateUseCase.execute.mockResolvedValue(mockBudget);

    const command = { id: 'b-101', newAmount: 7500 };
    const result = await controller.updateBudget(command);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(command);
    expect(result.amount).toBe(7500);
  });

  it('delegates archiveBudget call to archiveBudgetUseCase', async () => {
    mockArchiveUseCase.execute.mockResolvedValue(undefined);
    await controller.archiveBudget({ id: 'b-101' });
    expect(mockArchiveUseCase.execute).toHaveBeenCalledWith({ id: 'b-101' });
  });

  it('delegates listBudgets call to listBudgetsUseCase', async () => {
    mockListUseCase.execute.mockResolvedValue([]);
    const result = await controller.listBudgets();
    expect(mockListUseCase.execute).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
