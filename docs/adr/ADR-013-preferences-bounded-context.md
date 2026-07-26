# ADR-013: Preferences Bounded Context Architecture

## Status
Accepted

## Context
Application settings and user preferences (theme, currency code, first day of week, decimal precision, default category links, notification settings) were previously unmodeled or dispersed. A scalable, clean architecture was needed to manage preferences independently without coupling to financial aggregates (Expenses, Budgets, Categories).

## Decision
We introduced a dedicated **`Preferences`** bounded context (`src/features/preferences`) following Clean Architecture, Domain-Driven Design (DDD), and SOLID principles:

1. **Aggregate Root**: `Preferences` entity (`src/features/preferences/domain/entities/Preferences.ts`).
2. **Immutable Value Objects**:
   - `AppearanceSettings` (`Theme`: System, Light, Dark)
   - `FinanceSettings` (`CurrencyCode` ISO-4217, `WeekStart`, `DecimalPrecision`)
   - `DefaultSettings` (`defaultExpenseCategoryId`, `defaultIncomeCategoryId`)
   - `NotificationSettings` (`budgetAlertsEnabled`, `dailyReminderEnabled`, `reminderTime` 24-hour HH:MM)
3. **Application Orchestration**:
   - `InitializePreferencesUseCase` handles auto-creating default preferences via `Preferences.createDefault()` domain factory.
   - `UpdateDefaultExpenseCategoryUseCase` & `UpdateDefaultIncomeCategoryUseCase` validate category kinds (`Expense` vs `Income`).
   - `INotificationService` boundary abstracts platform notifications.
4. **Presentation & Facade**:
   - `PreferencesController` acts as a state coordinator facade behind `usePreferences` and `useUpdatePreference` hooks.
   - `SettingsScreen` consumes `PreferencesViewModel` exclusively. Presentation contains zero business logic.
   - Route wrapper `app/(tabs)/settings.tsx` is a thin wrapper conforming to ADR-011.

## Consequences
- **Positive**: High domain cohesion, total isolation from transaction aggregates, platform-agnostic notification scheduling, and zero presentation leakage.
- **Future-Ready**: Prepares the codebase for cloud sync, organization policies, and multi-device preferences without architectural redesign.
