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
import { AppInfoProvider } from '../../../../platform/system/AppInfoProvider';
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
    const [preferencesDto, categories] = await Promise.all([
      this.initializePreferencesUseCase.execute(userId),
      this.listCategoriesUseCase.execute({ includeArchived: false }).catch(() => []),
    ]);

    const viewModel = PreferencesViewModelMapper.mapToViewModel(
      preferencesDto,
      categories as any,
      this.appInfoProvider.getAppInfo()
    );

    return { viewModel, categories: categories as any };
  }

  public async updateTheme(theme: Theme, userId?: string): Promise<void> {
    await this.updateThemeUseCase.execute({ theme, userId });
  }

  public async updateCurrency(currencyCode: string, userId?: string): Promise<void> {
    await this.updateCurrencyUseCase.execute({ currencyCode, userId });
  }

  public async updateWeekStart(weekStart: WeekStart, userId?: string): Promise<void> {
    await this.updateWeekStartUseCase.execute({ weekStart, userId });
  }

  public async updateDecimalPrecision(decimalPrecision: DecimalPrecision, userId?: string): Promise<void> {
    await this.updateDecimalPrecisionUseCase.execute({ decimalPrecision, userId });
  }

  public async updateDefaultExpenseCategory(categoryId: string | null, userId?: string): Promise<void> {
    await this.updateDefaultExpenseCategoryUseCase.execute({ categoryId, userId });
  }

  public async updateDefaultIncomeCategory(categoryId: string | null, userId?: string): Promise<void> {
    await this.updateDefaultIncomeCategoryUseCase.execute({ categoryId, userId });
  }

  public async updateNotificationSettings(
    data: { budgetAlertsEnabled: boolean; dailyReminderEnabled: boolean; reminderTime?: string | null },
    userId?: string
  ): Promise<void> {
    await this.updateNotificationSettingsUseCase.execute({ ...data, userId });
  }
}
