import { describe, it, expect } from 'vitest';
import { InMemoryPreferencesRepository } from '../../application/__tests__/InMemoryPreferencesRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { MockNotificationService } from '../../application/__tests__/MockNotificationService';
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
import { PreferencesController } from '../../presentation/controllers/PreferencesController';
import { Theme } from '../../domain';

describe('Preferences Lifecycle End-to-End Integration', () => {
  it('should handle full lifecycle: Fresh install -> Auto initialize -> Load -> Update Theme -> App restart persistence', async () => {
    // 1. Fresh installation setup (shared persistence store)
    const preferencesRepository = new InMemoryPreferencesRepository();
    const categoryRepository = new InMemoryCategoryRepository();
    const notificationService = new MockNotificationService();

    const loadUseCase = new LoadPreferencesUseCase(preferencesRepository);
    const initUseCase = new InitializePreferencesUseCase(preferencesRepository);
    const updateThemeUseCase = new UpdateThemeUseCase(preferencesRepository);
    const updateCurrencyUseCase = new UpdateCurrencyUseCase(preferencesRepository);
    const updateWeekStartUseCase = new UpdateWeekStartUseCase(preferencesRepository);
    const updateDecimalPrecisionUseCase = new UpdateDecimalPrecisionUseCase(preferencesRepository);
    const updateExpenseCatUseCase = new UpdateDefaultExpenseCategoryUseCase(preferencesRepository, categoryRepository);
    const updateIncomeCatUseCase = new UpdateDefaultIncomeCategoryUseCase(preferencesRepository, categoryRepository);
    const updateNotifUseCase = new UpdateNotificationSettingsUseCase(preferencesRepository, notificationService);
    const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);

    const controller = new PreferencesController(
      loadUseCase,
      initUseCase,
      updateThemeUseCase,
      updateCurrencyUseCase,
      updateWeekStartUseCase,
      updateDecimalPrecisionUseCase,
      updateExpenseCatUseCase,
      updateIncomeCatUseCase,
      updateNotifUseCase,
      listCategoriesUseCase
    );

    // Verify fresh state before load: Repository has no record
    const preCheck = await preferencesRepository.get('user-lifecycle-1');
    expect(preCheck.success).toBe(true);
    if (preCheck.success) {
      expect(preCheck.data).toBeNull();
    }

    // 2. App Boot / First Load: Auto-initializes and returns default ViewModel
    const { viewModel: initialVm } = await controller.loadViewModel('user-lifecycle-1');
    expect(initialVm.appearance.theme).toBe(Theme.System);
    expect(initialVm.finance.currencyCode).toBe('INR');

    // 3. User Action: Update Theme to Dark
    await controller.updateTheme(Theme.Dark, 'user-lifecycle-1');

    // 4. Reload ViewModel from controller
    const { viewModel: updatedVm } = await controller.loadViewModel('user-lifecycle-1');
    expect(updatedVm.appearance.theme).toBe(Theme.Dark);

    // 5. Simulated App Restart (New instance of Controller using same underlying persistence repository)
    const restartController = new PreferencesController(
      new LoadPreferencesUseCase(preferencesRepository),
      new InitializePreferencesUseCase(preferencesRepository),
      new UpdateThemeUseCase(preferencesRepository),
      new UpdateCurrencyUseCase(preferencesRepository),
      new UpdateWeekStartUseCase(preferencesRepository),
      new UpdateDecimalPrecisionUseCase(preferencesRepository),
      new UpdateDefaultExpenseCategoryUseCase(preferencesRepository, categoryRepository),
      new UpdateDefaultIncomeCategoryUseCase(preferencesRepository, categoryRepository),
      new UpdateNotificationSettingsUseCase(preferencesRepository, notificationService),
      new ListCategoriesUseCase(categoryRepository)
    );

    const { viewModel: restoredVm } = await restartController.loadViewModel('user-lifecycle-1');
    expect(restoredVm.appearance.theme).toBe(Theme.Dark);
    expect(restoredVm.finance.currencyCode).toBe('INR');
  });
});
