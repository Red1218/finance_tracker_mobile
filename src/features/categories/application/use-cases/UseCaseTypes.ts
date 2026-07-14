import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { CategoryDomainError } from '../../domain';

export type CategoryApplicationError = CategoryDomainError | RepositoryError | Error;

export type UseCaseResult<T = void> = RepositoryResult<T, CategoryApplicationError>;
