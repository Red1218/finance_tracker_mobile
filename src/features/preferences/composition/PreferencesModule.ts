import {
  LoadPreferencesUseCase,
  InitializePreferencesUseCase,
  UpdateThemeUseCase,
  UpdateCurrencyUseCase,
  UpdateWeekStartUseCase,
  UpdateDecimalPrecisionUseCase,
  UpdateDefaultExpenseCategoryUseCase,
  UpdateDefaultIncomeCategoryUseCase,
  UpdateNotificationSettingsUseCase,
  IPreferencesRepository,
} from '../application';
import { SupabasePreferencesRepository } from '../../../platform/persistence/preferences/SupabasePreferencesRepository';
import { ExpoNotificationService } from '../../../platform/notifications/ExpoNotificationService';
import { SupabaseCategoryRepository } from '../../../platform/persistence/categories/SupabaseCategoryRepository';
import { ICategoryRepository } from '../../categories';
import { ListCategoriesUseCase } from '../../categories/application/use-cases/ListCategoriesUseCase';
import { PreferencesController } from '../presentation/controllers/PreferencesController';

export class PreferencesModule {
  public readonly preferencesRepository: IPreferencesRepository;
  public readonly controller: PreferencesController;
  public readonly loadPreferencesUseCase: LoadPreferencesUseCase;
  public readonly initializePreferencesUseCase: InitializePreferencesUseCase;
  public readonly updateThemeUseCase: UpdateThemeUseCase;
  public readonly updateCurrencyUseCase: UpdateCurrencyUseCase;
  public readonly updateWeekStartUseCase: UpdateWeekStartUseCase;
  public readonly updateDecimalPrecisionUseCase: UpdateDecimalPrecisionUseCase;
  public readonly updateDefaultExpenseCategoryUseCase: UpdateDefaultExpenseCategoryUseCase;
  public readonly updateDefaultIncomeCategoryUseCase: UpdateDefaultIncomeCategoryUseCase;
  public readonly updateNotificationSettingsUseCase: UpdateNotificationSettingsUseCase;
  public readonly listCategoriesUseCase: ListCategoriesUseCase;

  constructor() {
    this.preferencesRepository = new SupabasePreferencesRepository();
    const notificationService = new ExpoNotificationService();
    const categoryRepository: ICategoryRepository = new SupabaseCategoryRepository();

    this.loadPreferencesUseCase = new LoadPreferencesUseCase(this.preferencesRepository);
    this.initializePreferencesUseCase = new InitializePreferencesUseCase(this.preferencesRepository);
    this.updateThemeUseCase = new UpdateThemeUseCase(this.preferencesRepository);
    this.updateCurrencyUseCase = new UpdateCurrencyUseCase(this.preferencesRepository);
    this.updateWeekStartUseCase = new UpdateWeekStartUseCase(this.preferencesRepository);
    this.updateDecimalPrecisionUseCase = new UpdateDecimalPrecisionUseCase(this.preferencesRepository);
    this.updateDefaultExpenseCategoryUseCase = new UpdateDefaultExpenseCategoryUseCase(
      this.preferencesRepository,
      categoryRepository
    );
    this.updateDefaultIncomeCategoryUseCase = new UpdateDefaultIncomeCategoryUseCase(
      this.preferencesRepository,
      categoryRepository
    );
    this.updateNotificationSettingsUseCase = new UpdateNotificationSettingsUseCase(
      this.preferencesRepository,
      notificationService
    );
    this.listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);

    this.controller = new PreferencesController(
      this.loadPreferencesUseCase,
      this.initializePreferencesUseCase,
      this.updateThemeUseCase,
      this.updateCurrencyUseCase,
      this.updateWeekStartUseCase,
      this.updateDecimalPrecisionUseCase,
      this.updateDefaultExpenseCategoryUseCase,
      this.updateDefaultIncomeCategoryUseCase,
      this.updateNotificationSettingsUseCase,
      this.listCategoriesUseCase
    );

    Object.freeze(this);
  }
}
