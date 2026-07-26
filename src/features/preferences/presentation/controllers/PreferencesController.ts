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
} from '../../application';
import { ListCategoriesUseCase } from '../../../categories/application/use-cases/ListCategoriesUseCase';
import { Theme, WeekStart, DecimalPrecision } from '../../domain';
import { Category } from '../../../categories/domain';
import { AppInfoProvider, AppInfo } from '../../../../platform/system/AppInfoProvider';
import { PreferencesViewModel } from '../models/PreferencesViewModel';
import { PreferencesViewModelMapper } from '../mappers/PreferencesViewModelMapper';

export class PreferencesController {
  private readonly appInfoProvider: AppInfoProvider;

  constructor(
    public readonly loadPreferencesUseCase: LoadPreferencesUseCase,
    public readonly initializePreferencesUseCase: InitializePreferencesUseCase,
    public readonly updateThemeUseCase: UpdateThemeUseCase,
    public readonly updateCurrencyUseCase: UpdateCurrencyUseCase,
    public readonly updateWeekStartUseCase: UpdateWeekStartUseCase,
    public readonly updateDecimalPrecisionUseCase: UpdateDecimalPrecisionUseCase,
    public readonly updateDefaultExpenseCategoryUseCase: UpdateDefaultExpenseCategoryUseCase,
    public readonly updateDefaultIncomeCategoryUseCase: UpdateDefaultIncomeCategoryUseCase,
    public readonly updateNotificationSettingsUseCase: UpdateNotificationSettingsUseCase,
    public readonly listCategoriesUseCase: ListCategoriesUseCase
  ) {
    this.appInfoProvider = new AppInfoProvider();
    Object.freeze(this);
  }

  public async loadViewModel(userId?: string): Promise<{
    viewModel: PreferencesViewModel;
    categories: Category[];
  }> {
    const [prefResult, categories] = await Promise.all([
      this.initializePreferencesUseCase.execute(userId),
      this.listCategoriesUseCase.execute({ includeArchived: false }).catch(() => []),
    ]);

    if (!prefResult.success) {
      throw prefResult.error;
    }

    const viewModel = PreferencesViewModelMapper.mapToViewModel(
      prefResult.data,
      categories,
      this.appInfoProvider.getAppInfo()
    );

    return { viewModel, categories };
  }

  public async updateTheme(theme: Theme, userId?: string): Promise<void> {
    const result = await this.updateThemeUseCase.execute({ theme, userId });
    if (!result.success) throw result.error;
  }

  public async updateCurrency(currencyCode: string, userId?: string): Promise<void> {
    const result = await this.updateCurrencyUseCase.execute({ currencyCode, userId });
    if (!result.success) throw result.error;
  }

  public async updateWeekStart(weekStart: WeekStart, userId?: string): Promise<void> {
    const result = await this.updateWeekStartUseCase.execute({ weekStart, userId });
    if (!result.success) throw result.error;
  }

  public async updateDecimalPrecision(decimalPrecision: DecimalPrecision, userId?: string): Promise<void> {
    const result = await this.updateDecimalPrecisionUseCase.execute({ decimalPrecision, userId });
    if (!result.success) throw result.error;
  }

  public async updateDefaultExpenseCategory(categoryId: string | null, userId?: string): Promise<void> {
    const result = await this.updateDefaultExpenseCategoryUseCase.execute({ categoryId, userId });
    if (!result.success) throw result.error;
  }

  public async updateDefaultIncomeCategory(categoryId: string | null, userId?: string): Promise<void> {
    const result = await this.updateDefaultIncomeCategoryUseCase.execute({ categoryId, userId });
    if (!result.success) throw result.error;
  }

  public async updateNotificationSettings(
    data: { budgetAlertsEnabled: boolean; dailyReminderEnabled: boolean; reminderTime?: string | null },
    userId?: string
  ): Promise<void> {
    const result = await this.updateNotificationSettingsUseCase.execute({ ...data, userId });
    if (!result.success) throw result.error;
  }
}
