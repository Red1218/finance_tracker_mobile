import { IExpenseRepository, ExpenseFilter } from '../repositories';
import { Expense, ExpenseId } from '../../domain';
import { RepositoryResult, Result, RepositoryError } from '../../../../platform/persistence';

export class InMemoryExpenseRepository implements IExpenseRepository {
  private expenses: Map<string, Expense> = new Map();

  async getById(id: ExpenseId): Promise<RepositoryResult<Expense | null, RepositoryError>> {
    const expense = this.expenses.get(id.value);
    return Result.success(expense || null);
  }

  async create(expense: Expense): Promise<RepositoryResult<void, RepositoryError>> {
    this.expenses.set(expense.id.value, expense);
    return Result.success(undefined);
  }

  async update(expense: Expense): Promise<RepositoryResult<void, RepositoryError>> {
    this.expenses.set(expense.id.value, expense);
    return Result.success(undefined);
  }

  async delete(id: ExpenseId): Promise<RepositoryResult<void, RepositoryError>> {
    const expense = this.expenses.get(id.value);
    if (expense) {
      this.expenses.set(id.value, expense.delete());
    }
    return Result.success(undefined);
  }

  async restore(id: ExpenseId): Promise<RepositoryResult<void, RepositoryError>> {
    const expense = this.expenses.get(id.value);
    if (expense) {
      this.expenses.set(id.value, expense.restore());
    }
    return Result.success(undefined);
  }

  async list(filter?: ExpenseFilter, limit?: number, offset?: number): Promise<RepositoryResult<Expense[], RepositoryError>> {
    let results = Array.from(this.expenses.values());

    const visibility = filter?.visibility || 'active';
    if (visibility === 'active') {
      results = results.filter(e => !e.isDeleted);
    } else if (visibility === 'deleted') {
      results = results.filter(e => e.isDeleted);
    }

    if (filter) {
      if (filter.categoryId) {
        results = results.filter((e) => e.categoryId.equals(filter.categoryId!));
      }
      if (filter.startDate) {
        results = results.filter((e) => e.date.value >= filter.startDate!);
      }
      if (filter.endDate) {
        results = results.filter((e) => e.date.value <= filter.endDate!);
      }
    }

    results.sort((a, b) => b.date.value - a.date.value);
    
    if (offset !== undefined) results = results.slice(offset);
    if (limit !== undefined) results = results.slice(0, limit);
    
    return Result.success(results);
  }
}
