import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { CreateBudgetUseCase } from '../use-cases/CreateBudgetUseCase';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { Result } from '../../../../platform/persistence';
import { Category, CategoryId, CategoryName, CategoryType } from '../../../categories/domain';
import { BudgetPeriod, BudgetDomainError } from '../../domain';

describe('CreateBudgetUseCase', () => {
  let budgetRepository: Mocked<IBudgetRepository>;
  let categoryRepository: Mocked<ICategoryRepository>;
  let useCase: CreateBudgetUseCase;

  const validRequest = {
    categoryId: 'a1234567-b89c-42d3-a456-426614174000',
    amount: 5000,
    currencyCode: 'INR',
    period: BudgetPeriod.Monthly,
    startDate: new Date('2026-08-01T00:00:00Z'),
    endDate: new Date('2026-08-31T23:59:59Z'),
  };

  const mockCategory = new Category({
    id: new CategoryId(validRequest.categoryId),
    name: new CategoryName('Groceries'),
    type: 'expense' as any,
    isArchived: false,
  });

  const mockArchivedCategory = new Category({
    id: new CategoryId(validRequest.categoryId),
    name: new CategoryName('Old Groceries'),
    type: 'expense' as any,
    isArchived: true,
  });

  beforeEach(() => {
    budgetRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      findOverlappingBudget: vi.fn(),
      getBudgetSummary: vi.fn(),
    };

    categoryRepository = {
      getById: vi.fn(),
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      restore: vi.fn(),
      existsByName: vi.fn(),
    };

    useCase = new CreateBudgetUseCase(budgetRepository, categoryRepository);
  });

  it('✓ create success for category budget', async () => {
    categoryRepository.getById.mockResolvedValue(Result.success(mockCategory));
    budgetRepository.findOverlappingBudget.mockResolvedValue(Result.success(null));
    budgetRepository.create.mockResolvedValue(Result.success(undefined as void));

    const result = await useCase.execute(validRequest);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId?.value).toBe(validRequest.categoryId);
      expect(result.data.amount.value).toBe(5000);
    }
  });

  it('✓ create success for overall budget', async () => {
    const overallReq = { ...validRequest, categoryId: null };
    budgetRepository.findOverlappingBudget.mockResolvedValue(Result.success(null));
    budgetRepository.create.mockResolvedValue(Result.success(undefined as void));

    const result = await useCase.execute(overallReq);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBeNull();
    }
    expect(categoryRepository.getById).not.toHaveBeenCalled();
  });

  it('✓ duplicate category budget', async () => {
    categoryRepository.getById.mockResolvedValue(Result.success(mockCategory));
    // Simulate overlap found
    budgetRepository.findOverlappingBudget.mockResolvedValue(Result.success({} as any));

    const result = await useCase.execute(validRequest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(BudgetDomainError);
      expect((result.error as BudgetDomainError).code).toBe('DUPLICATE_BUDGET');
    }
  });

  it('✓ duplicate overall budget', async () => {
    const overallReq = { ...validRequest, categoryId: null };
    budgetRepository.findOverlappingBudget.mockResolvedValue(Result.success({} as any));

    const result = await useCase.execute(overallReq);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(BudgetDomainError);
      expect((result.error as BudgetDomainError).code).toBe('DUPLICATE_BUDGET');
    }
  });

  it('✓ inactive category', async () => {
    categoryRepository.getById.mockResolvedValue(Result.success(mockArchivedCategory));
    budgetRepository.findOverlappingBudget.mockResolvedValue(Result.success(null));

    const result = await useCase.execute(validRequest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(BudgetDomainError);
      expect((result.error as BudgetDomainError).code).toBe('CATEGORY_INACTIVE');
    }
  });

  it('✓ category missing', async () => {
    // Repository returns success but null data (not found)
    categoryRepository.getById.mockResolvedValue(Result.success(null));

    const result = await useCase.execute(validRequest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(BudgetDomainError);
      expect((result.error as BudgetDomainError).code).toBe('CATEGORY_MISMATCH');
    }
  });
});
