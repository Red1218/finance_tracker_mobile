import { IExpenseRepository, ExpenseFilter } from '../repositories';
import { Expense, ExpenseId } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export class InMemoryExpenseRepository implements IExpenseRepository {
  private expenses: Map<string, Expense> = new Map();

  async getById(id: ExpenseId): Promise<RepositoryResult<Expense | null>> {
    const expense = this.expenses.get(id.value);
    return Result.success(expense || null);
  }

  async create(expense: Expense): Promise<RepositoryResult<void>> {
    this.expenses.set(expense.id.value, expense);
    return Result.success(undefined);
  }

  async update(expense: Expense): Promise<RepositoryResult<void>> {
    this.expenses.set(expense.id.value, expense);
    return Result.success(undefined);
  }

  async delete(id: ExpenseId): Promise<RepositoryResult<void>> {
    this.expenses.delete(id.value);
    return Result.success(undefined);
  }

  async list(filter: ExpenseFilter): Promise<RepositoryResult<Expense[]>> {
    let results = Array.from(this.expenses.values());

    if (filter.categoryId) {
      results = results.filter((e) => e.categoryId.equals(filter.categoryId!));
    }
    if (filter.startDate) {
      results = results.filter((e) => e.date.value >= filter.startDate!);
    }
    if (filter.endDate) {
      results = results.filter((e) => e.date.value <= filter.endDate!);
    }

    results.sort((a, b) => b.date.value - a.date.value);
    return Result.success(results);
  }
}
