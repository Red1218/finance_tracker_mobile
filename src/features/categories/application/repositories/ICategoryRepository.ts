import { RepositoryError } from '../../../../platform/persistence/RepositoryError';
import { RepositoryResult } from '../../../../platform/persistence/RepositoryResult';
import { Category, CategoryId, CategoryName } from '../../domain';

export interface ICategoryRepository {
  getById(id: CategoryId): Promise<RepositoryResult<Category | null, RepositoryError>>;
  list(includeArchived?: boolean): Promise<RepositoryResult<Category[], RepositoryError>>;
  create(category: Category): Promise<RepositoryResult<void, RepositoryError>>;
  update(category: Category): Promise<RepositoryResult<void, RepositoryError>>;
  archive(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>>;
  restore(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>>;
  existsByName(name: CategoryName): Promise<RepositoryResult<boolean, RepositoryError>>;
}
