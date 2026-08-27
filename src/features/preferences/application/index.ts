export * from './dto/PreferencesDTO';
export * from './mappers/PreferencesDTOMapper';
export * from './errors/PreferencesApplicationError';
export * from './ports/IPreferencesRepository';
export * from './commands/InitializePreferencesUseCase';
export * from './commands/UpdateThemeCommand';
export * from './commands/UpdateThemeUseCase';
export * from './commands/UpdateCurrencyCommand';
export * from './commands/UpdateCurrencyUseCase';
export * from './commands/UpdateWeekStartCommand';
export * from './commands/UpdateWeekStartUseCase';
export * from './commands/UpdateDecimalPrecisionCommand';
export * from './commands/UpdateDecimalPrecisionUseCase';
export * from './commands/UpdateNotificationSettingsCommand';
export * from './commands/UpdateNotificationSettingsUseCase';
export * from './commands/UpdateDefaultCategoryUseCases';
export * from './queries/LoadPreferencesQueryUseCase';
export * from './use-cases/GetNotificationPermissionStatusUseCase';
export * from './use-cases/RequestNotificationPermissionUseCase';

// Backward compatibility re-export
export { LoadPreferencesQueryUseCase as LoadPreferencesUseCase } from './queries/LoadPreferencesQueryUseCase';
