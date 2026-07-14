import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { Category, CategoryId, CategoryName } from '../../domain';

export interface ICategoryRepository {
  getById(id: CategoryId): Promise<RepositoryResult<Category | null, RepositoryError>>;
  list(): Promise<RepositoryResult<Category[], RepositoryError>>;
  create(category: Category): Promise<RepositoryResult<void, RepositoryError>>;
  update(category: Category): Promise<RepositoryResult<void, RepositoryError>>;
  delete(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>>;
  existsByName(name: CategoryName): Promise<RepositoryResult<boolean, RepositoryError>>;
}
