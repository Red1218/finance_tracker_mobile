import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { CategoryId, CategoryKind } from '../../../categories/domain';
import { DefaultSettings, Preferences, PreferencesDomainError } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface UpdateDefaultExpenseCategoryRequest {
  categoryId: string | null;
  userId?: string;
}

export class UpdateDefaultExpenseCategoryUseCase {
  constructor(
    private readonly preferencesRepository: IPreferencesRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(request: UpdateDefaultExpenseCategoryRequest): Promise<RepositoryResult<Preferences, Error>> {
    try {
      let expenseCatId: CategoryId | null = null;
      if (request.categoryId) {
        const catId = new CategoryId(request.categoryId);
        const catResult = await this.categoryRepository.getById(catId);
        if (!catResult.success) {
          return catResult as RepositoryResult<never, Error>;
        }

        if (!catResult.data || catResult.data.kind !== CategoryKind.Expense) {
          return Result.failure(
            new PreferencesDomainError(
              'INVALID_DEFAULT_CATEGORY',
              'Default expense category must be a valid Expense category.'
            )
          );
        }
        expenseCatId = catId;
      }

      const currentResult = await this.preferencesRepository.get(request.userId);
      if (!currentResult.success) {
        return currentResult as RepositoryResult<never, Error>;
      }

      const current = currentResult.data ?? Preferences.createDefault(undefined, request.userId);
      const updatedDefaults = new DefaultSettings({
        defaultExpenseCategoryId: expenseCatId,
        defaultIncomeCategoryId: current.defaults.defaultIncomeCategoryId,
      });

      const updated = current.updateDefaults(updatedDefaults);
      const saveResult = await this.preferencesRepository.save(updated);
      if (!saveResult.success) {
        return saveResult as RepositoryResult<never, Error>;
      }

      return Result.success(updated);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
