import { CategoryValidationService } from '../../../categories/application/services/CategoryValidationService';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { DefaultSettings } from '../../domain';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';
import { PreferencesNotFoundError } from '../errors/PreferencesApplicationError';

export interface UpdateDefaultCategoryCommand {
  categoryId: string | null;
  userId?: string;
}

export class UpdateDefaultExpenseCategoryUseCase {
  private readonly categoryValidationService?: CategoryValidationService;

  constructor(
    private readonly preferencesRepository: IPreferencesRepository,
    categoryRepoOrService?: ICategoryRepository | CategoryValidationService
  ) {
    if (categoryRepoOrService) {
      this.categoryValidationService =
        categoryRepoOrService instanceof CategoryValidationService
          ? categoryRepoOrService
          : new CategoryValidationService(categoryRepoOrService);
    }
    Object.freeze(this);
  }

  public async execute(command: UpdateDefaultCategoryCommand): Promise<PreferencesDTO> {
    if (this.categoryValidationService && command.categoryId) {
      await this.categoryValidationService.validateCategoryForKind(command.categoryId, 'EXPENSE');
    }

    const getResult = await this.preferencesRepository.get();
    if (!getResult.success || !getResult.data) {
      throw new PreferencesNotFoundError();
    }

    const currentDefaults = getResult.data.defaults;
    const updatedDefaults = new DefaultSettings({
      defaultExpenseCategoryId: command.categoryId ? (command.categoryId as any) : null,
      defaultIncomeCategoryId: currentDefaults.defaultIncomeCategoryId,
    });

    const updated = getResult.data.updateDefaults(updatedDefaults);
    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(updated);
  }
}

export class UpdateDefaultIncomeCategoryUseCase {
  private readonly categoryValidationService?: CategoryValidationService;

  constructor(
    private readonly preferencesRepository: IPreferencesRepository,
    categoryRepoOrService?: ICategoryRepository | CategoryValidationService
  ) {
    if (categoryRepoOrService) {
      this.categoryValidationService =
        categoryRepoOrService instanceof CategoryValidationService
          ? categoryRepoOrService
          : new CategoryValidationService(categoryRepoOrService);
    }
    Object.freeze(this);
  }

  public async execute(command: UpdateDefaultCategoryCommand): Promise<PreferencesDTO> {
    if (this.categoryValidationService && command.categoryId) {
      await this.categoryValidationService.validateCategoryForKind(command.categoryId, 'INCOME');
    }

    const getResult = await this.preferencesRepository.get();
    if (!getResult.success || !getResult.data) {
      throw new PreferencesNotFoundError();
    }

    const currentDefaults = getResult.data.defaults;
    const updatedDefaults = new DefaultSettings({
      defaultExpenseCategoryId: currentDefaults.defaultExpenseCategoryId,
      defaultIncomeCategoryId: command.categoryId ? (command.categoryId as any) : null,
    });

    const updated = getResult.data.updateDefaults(updatedDefaults);
    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(updated);
  }
}
