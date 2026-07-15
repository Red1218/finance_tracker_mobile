import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category, CategoryId, CategoryName } from '../../domain';
import { Result, RepositoryResult, RepositoryError } from '../../../../platform/persistence';

export class InMemoryCategoryRepository implements ICategoryRepository {
  private categories: Map<string, Category> = new Map();
  private forceFailureMessage: string | null = null;

  public setForceFailure(message: string) {
    this.forceFailureMessage = message;
  }

  public seed(category: Category) {
    this.categories.set(category.id.value, category);
  }

  private checkFailure<T>(): RepositoryResult<T, RepositoryError> | null {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }
    return null;
  }

  async existsByName(name: CategoryName): Promise<RepositoryResult<boolean, RepositoryError>> {
    const failure = this.checkFailure<boolean>();
    if (failure) return failure;

    const exists = Array.from(this.categories.values()).some(
      (c) => c.name.value.toLowerCase() === name.value.toLowerCase()
    );
    return Result.success(exists);
  }

  async getById(id: CategoryId): Promise<RepositoryResult<Category | null, RepositoryError>> {
    const failure = this.checkFailure<Category | null>();
    if (failure) return failure;

    const category = this.categories.get(id.value) || null;
    return Result.success(category);
  }

  async list(): Promise<RepositoryResult<Category[], RepositoryError>> {
    const failure = this.checkFailure<Category[]>();
    if (failure) return failure;

    return Result.success(Array.from(this.categories.values()));
  }

  async create(category: Category): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    this.categories.set(category.id.value, category);
    return Result.success(undefined);
  }

  async update(category: Category): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    this.categories.set(category.id.value, category);
    return Result.success(undefined);
  }

  async delete(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    this.categories.delete(id.value);
    return Result.success(undefined);
  }
}
