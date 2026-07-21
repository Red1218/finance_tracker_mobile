import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { BudgetDomainError } from '../../domain/errors/BudgetDomainError';

export type BudgetApplicationError = BudgetDomainError | RepositoryError | Error;

export type UseCaseResult<T = void> = RepositoryResult<T, BudgetApplicationError>;
