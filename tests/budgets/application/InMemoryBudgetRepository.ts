import { IBudgetRepository, BudgetFilter } from '../../../src/features/budgets/application/repositories';
import { Budget } from '../../../src/features/budgets/domain/entities/Budget';
import { BudgetId } from '../../../src/features/budgets/domain/value-objects/BudgetId';
import { RepositoryResult, Result, RepositoryError } from '../../../src/platform/persistence';

export class InMemoryBudgetRepository implements IBudgetRepository {
  private budgets: Map<string, Budget> = new Map();

  async create(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    this.budgets.set(budget.id.value, budget);
    return { success: true, data: undefined };
  }

  async getById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    const budget = this.budgets.get(id.value) || null;
    if (budget && budget.deletedAt) {
      return { success: true, data: null }; // Exclude soft-deleted
    }
    return { success: true, data: budget };
  }

  async update(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    if (!this.budgets.has(budget.id.value)) {
      return { success: false, error: new RepositoryError('NOT_FOUND', 'Budget not found') };
    }
    this.budgets.set(budget.id.value, budget);
    return { success: true, data: undefined };
  }

  async delete(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>> {
    const budget = this.budgets.get(id.value);
    if (!budget) {
      return { success: false, error: new RepositoryError('NOT_FOUND', 'Budget not found') };
    }
    // Implement soft delete simulation if we want, or hard delete in memory.
    // For now, let's just delete.
    this.budgets.delete(id.value);
    return { success: true, data: undefined };
  }

  async list(filter?: BudgetFilter, limit?: number, offset?: number): Promise<RepositoryResult<Budget[], RepositoryError>> {
    let result = Array.from(this.budgets.values()).filter(b => !b.deletedAt);

    if (filter) {
      if (filter.period) {
        result = result.filter(b => b.period.value === filter.period!.value);
      }
      if (filter.status) {
        result = result.filter(b => b.status.value === filter.status!.value);
      }
      if (filter.categoryId !== undefined) {
        result = result.filter(b => b.categoryId?.value === filter.categoryId!.value);
      }
    }

    // Apply basic pagination
    if (offset !== undefined) {
      result = result.slice(offset);
    }
    if (limit !== undefined) {
      result = result.slice(0, limit);
    }

    return { success: true, data: result };
  }

  // Helper method for testing
  seed(budgets: Budget[]) {
    budgets.forEach(b => this.budgets.set(b.id.value, b));
  }
}
