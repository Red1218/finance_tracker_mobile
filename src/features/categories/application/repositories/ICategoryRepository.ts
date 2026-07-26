import { RepositoryError } from '../../../../platform/persistence/RepositoryError';
import { RepositoryResult } from '../../../../platform/persistence/RepositoryResult';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../domain';

export interface ICategoryRepository {
  getById(id: CategoryId): Promise<RepositoryResult<Category | null, RepositoryError>>;
  list(includeArchived?: boolean, kind?: CategoryKind): Promise<RepositoryResult<Category[], RepositoryError>>;
  getAll(kind?: CategoryKind, includeArchived?: boolean): Promise<RepositoryResult<Category[], RepositoryError>>;
  save(category: Category): Promise<RepositoryResult<void, RepositoryError>>;
  create(category: Category): Promise<RepositoryResult<void, RepositoryError>>;
  update(category: Category): Promise<RepositoryResult<void, RepositoryError>>;
  archive(id: CategoryId, archivedAt?: Date): Promise<RepositoryResult<void, RepositoryError>>;
  restore(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>>;
  existsByName(name: CategoryName): Promise<RepositoryResult<boolean, RepositoryError>>;
  existsByNameAndKind(name: string, kind: CategoryKind, excludeCategoryId?: string): Promise<RepositoryResult<boolean, RepositoryError>>;
}
