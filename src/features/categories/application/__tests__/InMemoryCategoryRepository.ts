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

  public getAll(): Category[] {
    return Array.from(this.categories.values());
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
      (c) => c.name.value.toLowerCase() === name.value.toLowerCase() && !c.isArchived
    );
    return Result.success(exists);
  }

  async getById(id: CategoryId): Promise<RepositoryResult<Category | null, RepositoryError>> {
    const failure = this.checkFailure<Category | null>();
    if (failure) return failure;

    const category = this.categories.get(id.value) || null;
    return Result.success(category);
  }

  async list(includeArchived?: boolean): Promise<RepositoryResult<Category[], RepositoryError>> {
    const failure = this.checkFailure<Category[]>();
    if (failure) return failure;

    let categories = Array.from(this.categories.values());
    if (!includeArchived) {
      categories = categories.filter(c => !c.isArchived);
    }
    return Result.success(categories);
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

  async archive(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    const category = this.categories.get(id.value);
    if (category) {
      this.categories.set(id.value, category.archive());
    }
    return Result.success(undefined);
  }

  async restore(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>> {
    const failure = this.checkFailure<void>();
    if (failure) return failure;

    const category = this.categories.get(id.value);
    if (category) {
      this.categories.set(id.value, category.restore());
    }
    return Result.success(undefined);
  }
}
