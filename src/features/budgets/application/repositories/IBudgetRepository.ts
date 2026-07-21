import { Budget, BudgetId, BudgetPeriod } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { BudgetSummaryData } from '../projections/BudgetSummaryData';

export interface IBudgetRepository {
  create(budget: Budget): Promise<RepositoryResult<void, RepositoryError>>;
  update(budget: Budget): Promise<RepositoryResult<void, RepositoryError>>;
  delete(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>>;
  findById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>>;
  list(): Promise<RepositoryResult<Budget[], RepositoryError>>;
  findOverlappingBudget(
    categoryId: CategoryId | null,
    period: BudgetPeriod,
    startDate: Date,
    endDate: Date
  ): Promise<RepositoryResult<Budget | null, RepositoryError>>;
  getBudgetSummary(id: BudgetId): Promise<RepositoryResult<BudgetSummaryData | null, RepositoryError>>;
}
