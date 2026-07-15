import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { Budget, BudgetId } from '../../domain';
import { BudgetFilter } from './BudgetFilter';

export interface IBudgetRepository {
  getById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>>;
  list(filter?: BudgetFilter): Promise<RepositoryResult<Budget[], RepositoryError>>;
  create(budget: Budget): Promise<RepositoryResult<void, RepositoryError>>;
  update(budget: Budget): Promise<RepositoryResult<void, RepositoryError>>;
  delete(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>>;
}
