import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { Expense, ExpenseId } from '../../domain';
import { ExpenseFilter } from './ExpenseFilter';

export interface IExpenseRepository {
  getById(id: ExpenseId): Promise<RepositoryResult<Expense | null, RepositoryError>>;
  list(filter?: ExpenseFilter, limit?: number, offset?: number): Promise<RepositoryResult<Expense[], RepositoryError>>;
  create(expense: Expense): Promise<RepositoryResult<void, RepositoryError>>;
  update(expense: Expense): Promise<RepositoryResult<void, RepositoryError>>;
  delete(id: ExpenseId): Promise<RepositoryResult<void, RepositoryError>>;
  restore(id: ExpenseId): Promise<RepositoryResult<void, RepositoryError>>;
}
