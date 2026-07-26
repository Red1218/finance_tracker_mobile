import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { Budget, BudgetId, BudgetPeriod } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { Result, RepositoryResult, RepositoryError } from '../../../../platform/persistence';

export class InMemoryBudgetRepository implements IBudgetRepository {
  private budgets = new Map<string, Budget>();
  private forceFailureMessage: string | null = null;

  public setForceFailure(message: string) {
    this.forceFailureMessage = message;
  }

  public seed(budget: Budget) {
    this.budgets.set(budget.id.value, budget);
  }

  private checkFailure<T>(): RepositoryResult<T, RepositoryError> | null {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }
    return null;
  }

  async getById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    return this.findById(id);
  }

  async findById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    const failure = this.checkFailure<Budget | null>();
    if (failure) return failure;

    const budget = this.budgets.get(id.value) || null;
    return Result.success(budget);
  }

  async list(includeArchived?: boolean, categoryId?: string | null): Promise<RepositoryResult<Budget[], RepositoryError>> {
    const failure = this.checkFailure<Budget[]>();
    if (failure) return failure;

    let result = Array.from(this.budgets.values());

    if (!includeArchived) {
      result = result.filter((b) => !b.isArchived);
    }

    if (categoryId !== undefined) {
      if (categoryId === null) {
        result = result.filter((b) => b.isOverall);
      } else {
        result = result.filter((b) => b.categoryId?.value === categoryId);
      }
    }

    return Result.success(result);
  }

  async save(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    this.budgets.set(budget.id.value, budget);
    return Result.success(undefined);
  }

  async create(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    return this.save(budget);
  }

  async update(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    return this.save(budget);
  }

  async delete(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    this.budgets.delete(id.value);
    return Result.success(undefined);
  }

  async archive(id: BudgetId, archivedAt: Date = new Date()): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    const budget = this.budgets.get(id.value);
    if (budget) {
      this.budgets.set(id.value, budget.archive(archivedAt));
    }
    return Result.success(undefined);
  }

  async restore(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    const budget = this.budgets.get(id.value);
    if (budget) {
      this.budgets.set(id.value, budget.restore());
    }
    return Result.success(undefined);
  }

  async findOverlappingBudget(
    categoryId: CategoryId | null,
    period: BudgetPeriod,
    excludeBudgetId?: string
  ): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    const failure = this.checkFailure<Budget | null>();
    if (failure) return failure;

    const match = Array.from(this.budgets.values()).find((b) => {
      if (excludeBudgetId && b.id.value === excludeBudgetId) return false;
      if (b.isArchived) return false;

      const sameScope =
        categoryId === null
          ? b.isOverall
          : b.categoryId !== null && b.categoryId.equals(categoryId);

      if (!sameScope) return false;

      return b.period.intersects(period);
    });

    return Result.success(match ?? null);
  }

  public clear(): void {
    this.budgets.clear();
  }
}
