import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { ExpenseDomainError } from '../../domain/errors';

export type ExpenseApplicationError = ExpenseDomainError | RepositoryError | Error;

export type UseCaseResult<T = void> = RepositoryResult<T, ExpenseApplicationError>;
