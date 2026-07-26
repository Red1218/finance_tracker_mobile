import { Budget, BudgetId, BudgetPeriod } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';

export interface IBudgetRepository {
  getById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>>;
  findById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>>;
  list(includeArchived?: boolean, categoryId?: string | null): Promise<RepositoryResult<Budget[], RepositoryError>>;
  save(budget: Budget): Promise<RepositoryResult<void, RepositoryError>>;
  create(budget: Budget): Promise<RepositoryResult<void, RepositoryError>>;
  update(budget: Budget): Promise<RepositoryResult<void, RepositoryError>>;
  delete(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>>;
  archive(id: BudgetId, archivedAt?: Date): Promise<RepositoryResult<void, RepositoryError>>;
  restore(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>>;
  findOverlappingBudget(
    categoryId: CategoryId | null,
    period: BudgetPeriod,
    excludeBudgetId?: string
  ): Promise<RepositoryResult<Budget | null, RepositoryError>>;
}
