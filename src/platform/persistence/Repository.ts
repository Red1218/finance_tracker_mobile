import type { RepositoryResult } from './RepositoryResult';
import type { RepositoryError } from './RepositoryError';
import type { Entity, QueryOptions } from './Repository.types';

export interface Repository<T extends Entity> {
  getById(id: string): Promise<RepositoryResult<T | null, RepositoryError>>;
  list(options?: QueryOptions): Promise<RepositoryResult<T[], RepositoryError>>;
  create(payload: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<RepositoryResult<T, RepositoryError>>;
  update(id: string, payload: Partial<Omit<T, 'id'>>): Promise<RepositoryResult<T, RepositoryError>>;
  delete(id: string): Promise<RepositoryResult<void, RepositoryError>>;
}
