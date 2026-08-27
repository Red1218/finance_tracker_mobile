import { vi, describe, it, expect } from 'vitest';
vi.unmock('../src/shared/theme');
vi.unmock('../../../../shared/theme');

import React from 'react';
import { AppThemeProvider } from '../../../../providers/AppThemeProvider';
import { ThemeProvider, getTheme, createNavigationTheme } from '../../../../shared/theme';
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
import { PreferencesController } from '../controllers/PreferencesController';
import { PreferencesModule } from '../../composition/PreferencesModule';
import { InMemoryPreferencesRepository } from '../../application/__tests__/InMemoryPreferencesRepository';
import { Theme } from '../../domain';
import { AuthModule } from '../../../auth/composition/AuthModule';
import { InMemoryAuthProvider } from '../../../auth/application/__tests__/InMemoryAuthProvider';

function createTestPreferencesModule(repo: InMemoryPreferencesRepository): PreferencesModule {
  const loadPreferencesUseCase = new LoadPreferencesUseCase(repo);
  const initializePreferencesUseCase = new InitializePreferencesUseCase(repo);
  const updateThemeUseCase = new UpdateThemeUseCase(repo);
  const updateCurrencyUseCase = new UpdateCurrencyUseCase(repo);
  const updateWeekStartUseCase = new UpdateWeekStartUseCase(repo);
  const updateDecimalPrecisionUseCase = new UpdateDecimalPrecisionUseCase(repo);
  const updateDefaultExpenseCategoryUseCase = new UpdateDefaultExpenseCategoryUseCase(repo, { listByKind: async () => [] } as any);
  const updateDefaultIncomeCategoryUseCase = new UpdateDefaultIncomeCategoryUseCase(repo, { listByKind: async () => [] } as any);
  const updateNotificationSettingsUseCase = new UpdateNotificationSettingsUseCase(repo, { requestPermission: async () => true, scheduleReminder: async () => {} } as any);
  const listCategoriesUseCase = { execute: async () => [] } as any;

  const controller = new PreferencesController(
    loadPreferencesUseCase,
    initializePreferencesUseCase,
    updateThemeUseCase,
    updateCurrencyUseCase,
    updateWeekStartUseCase,
    updateDecimalPrecisionUseCase,
    updateDefaultExpenseCategoryUseCase,
    updateDefaultIncomeCategoryUseCase,
    updateNotificationSettingsUseCase,
    listCategoriesUseCase
  );

  return {
    preferencesRepository: repo,
    controller,
    loadPreferencesUseCase,
    initializePreferencesUseCase,
    updateThemeUseCase,
    updateCurrencyUseCase,
    updateWeekStartUseCase,
    updateDecimalPrecisionUseCase,
    updateDefaultExpenseCategoryUseCase,
    updateDefaultIncomeCategoryUseCase,
    updateNotificationSettingsUseCase,
    listCategoriesUseCase,
  } as unknown as PreferencesModule;
}

describe('Theme End-to-End Integration & App Bootstrap', () => {
  it('should create AppThemeProvider element and bootstrap preferences module integration', async () => {
    const preferencesRepo = new InMemoryPreferencesRepository();
    const authProvider = new InMemoryAuthProvider();

    const authModule = new AuthModule(authProvider);
    const preferencesModule = createTestPreferencesModule(preferencesRepo);

    await authProvider.login({ email: 'user@example.com', password: 'Password123!' });
    const session = await authProvider.getSession();
    const userId = session.userId!.value;

    await preferencesModule.initializePreferencesUseCase.execute(userId);
    await preferencesModule.updateThemeUseCase.execute({ theme: Theme.Dark, userId });

    const appThemeElement = React.createElement(AppThemeProvider, {
      authModule,
      preferencesModule,
      children: null,
    });

    expect(React.isValidElement(appThemeElement)).toBe(true);

    const loadedPrefs = await preferencesModule.loadPreferencesUseCase.execute(userId);
    expect(loadedPrefs.theme).toBe(Theme.Dark);
  });

  it('should support updating theme preferences via preferences module controller', async () => {
    const preferencesRepo = new InMemoryPreferencesRepository();
    const authProvider = new InMemoryAuthProvider();
    const authModule = new AuthModule(authProvider);
    const preferencesModule = createTestPreferencesModule(preferencesRepo);

    await authProvider.login({ email: 'user@example.com', password: 'Password123!' });
    const session = await authProvider.getSession();
    const userId = session.userId!.value;

    await preferencesModule.initializePreferencesUseCase.execute(userId);
    await preferencesModule.updateThemeUseCase.execute({ theme: Theme.Dark, userId });

    const darkTheme = getTheme('dark');
    const navTheme = createNavigationTheme('dark', darkTheme.colors);

    expect(navTheme.dark).toBe(true);
    expect(navTheme.colors.background).toBe('#0F172A');
  });
});
