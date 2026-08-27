# Phase 6 — Platform & Operations Investigation & Product Requirements

## 1. Executive Summary

This document establishes the official product requirements, architecture audit, capability inventory, and scope specification for **Phase 6 — Platform & Operations** of Finance Tracker Mobile. 

Phase 6 transitions the application from a feature-complete local analytics and budget tracker to a production-ready, resilient, offline-first mobile product with local notification infrastructure, encrypted local backup/restore, robust offline sync infrastructure, and formal EAS build/deployment workflows.

**Current Lifecycle Stage**: Investigation / Product Requirements & Discovery  
**Status**: APPROVED & FROZEN 🔒 (Post-Review Synchronization)  
**Governance Constraint**: 0 production code written, 0 Phase 5 frozen code altered, deferred Goals feature untouched.

---

## 2. Existing Architecture Audit

A thorough audit of the repository was conducted across `package.json`, `app.json`, `eas.json`, `src/platform/`, `src/features/preferences/`, `src/features/sync/`, `supabase/`, and `docs/adr/`.

### 2.1 Package Dependencies (`package.json`)
- **React Native / Expo**: Expo SDK 55 (`~55.0.28`), React Native `0.83.6`, React `19.2.0`.
- **Security & Storage**: `expo-secure-store` (`~55.0.16`) used for auth tokens; `@react-native-async-storage/async-storage` (`2.2.0`) used for preferences/cache; `expo-crypto` (`~55.0.17`) used for UUID and hashing.
- **Networking & Supabase**: `@supabase/supabase-js` (`^2.98.0`), `@tanstack/react-query` (`^5.90.21`).
- **Missing Dependencies**:
  - `expo-notifications` (Required for local scheduled and event-driven notifications).
  - `@react-native-community/netinfo` (Required for real-time network connectivity monitoring).
  - `expo-file-system` / `expo-document-picker` / `expo-sharing` (Required for backup export/import file system access).

### 2.2 Application & Platform Layers (`src/platform/`)
- **Notifications**: `INotificationService` interface in `src/features/preferences/application/services/` and `ExpoNotificationService` in `src/platform/notifications/ExpoNotificationService.ts` currently exist as a stub implementation without native `expo-notifications` binding.
- **Sync & Network**: `INetworkStatusProvider` in `src/features/sync/application/` and `NetworkStatusProviderImpl` in `src/platform/persistence/sync/` currently use a simulated in-memory `Set<listener>` with hardcoded `online = true`. `SupabaseSyncTransportProvider` handles remote RPC execution.
- **Preferences**: `NotificationSettings` value object (`budgetAlertsEnabled`, `billRemindersEnabled`, `reminderTime`) and `Preferences` aggregate root are implemented in `src/features/preferences/domain/`.

### 2.3 Build & Configuration Audit (`app.json`, `eas.json`)
- **`app.json`**:
  - App Name / Slug: currently configured as `"mobile_temp"` (Needs formal rename to `"Finance Tracker"` / `"finance-tracker-mobile"`).
  - Android Package: `"com.finance.tracker"` is configured.
  - Android Permissions: `RECEIVE_SMS`, `READ_SMS`. Missing `POST_NOTIFICATIONS` (Android 13+ requirement).
  - iOS Config: Missing explicit `bundleIdentifier` (Needs `"com.financetracker.mobile"`).
  - Expo Plugins: missing `expo-notifications`.
  - Extra EAS Project ID: `"4566a7da-4b68-46ee-93fe-b5eb8a740d91"`.
- **`eas.json`**:
  - EAS CLI requirement `>= 18.0.0`.
  - Configured profiles: `development`, `preview` (Android APK output), `production` (empty stub).
  - Missing environment variable mapping per profile (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

---

## 3. Existing Capability Inventory

| Area | Current Implementation | Phase 6 Gap / Requirement |
|---|---|---|
| **Notification Infrastructure** | Domain VO (`NotificationSettings`) & stub service | Native `expo-notifications` integration, OS local scheduling, in-app event triggers, permission lifecycle, Android channels, deep-linking |
| **Network Status Detection** | Hardcoded boolean `NetworkStatusProviderImpl` | Production `@react-native-community/netinfo` listener with auto-sync trigger |
| **Offline Data Persistence** | Local SQLite / Async Storage for read operations & sync queue | Append-only transaction creation queueing, conflict resolution strategies, data freshness indicators |
| **Backup & Restore** | CSV/PDF export in Phase 5 (reporting only) | Full encrypted AEAD container backup export (`.ftb`), schema validation, versioned import |
| **EAS Build & Config** | Basic `eas.json` with empty production profile | Environment-specific EAS profiles, secrets handling, app signing, store submission automation |
| **Settings UI** | Preferences screen with notification toggle switches | Backup & Restore controls, notification channel settings, sync status indicator |

---

## 4. Problem Definition

1. **Unreliable User Reminders**: Users currently miss upcoming bill due dates and budget thresholds because notification triggers are unanchored to OS background schedulers and mutation events.
2. **Brittle Network Transitions**: Loss of cellular/Wi-Fi connection during sync causes silent failure or unhandled state transitions due to simulated network status.
3. **Data Lock-in & Loss Risk**: Users changing devices or losing access to remote servers cannot export or restore their complete financial database locally in a secure, encrypted format.
4. **Build & Release Vulnerabilities**: Manual or unverified release profiles create environment variable leaks and store rejection risks (missing iOS bundle identifier, unconfigured Android notification permissions).

---

## 5. Product Goals

1. **Proactive Financial Alerts**: Deliver timely, low-power local OS notifications for bill reminders, daily digests, and event-driven budget threshold alerts (>80%, 100%).
2. **Seamless Offline Operations**: Enable robust offline transaction recording with append-only local queues, optimistic UI updates, and transparent background synchronization upon network restoration.
3. **User-Controlled Local Data Ownership**: Provide one-click encrypted AEAD container backup export (`.ftb`) and validated schema restore for privacy-first data portability.
4. **Production-Grade Release Pipeline**: Establish audited, multi-environment EAS build profiles (development, preview, production) ready for iOS App Store and Google Play Store submission.

---

## 6. Scope

- **Local Notifications & Notification Infrastructure**: Local scheduled bill reminders, daily digest notification, event-driven budget threshold alert triggers, OS permission lifecycle, Android notification channels, deep-linking to bill/budget screens. Dedicated remote push notification servers (APNs/FCM) are out of scope.
- **Offline Support & Sync Resilience**: `@react-native-community/netinfo` network monitoring, offline mutation queueing, automatic background retry with exponential backoff and random jitter, sync status banner.
- **Encrypted Local Backup & Restore**: Full database snapshot export, AEAD container format (`.ftb`) with user passphrase encryption, schema migration validator, restoration preview.
- **EAS Build & Deployment Pipeline**: Multi-profile `eas.json` setup, secret management, iOS App Store & Android Play Store deployment readiness.

---

## 7. Explicit Non-Goals

- **Server-side Remote Push Servers**: Push notifications will rely strictly on local OS scheduling and in-app event triggers; dedicated APNs/FCM backend push servers are out of scope.
- **Automatic Cloud Backup**: Auto-syncing raw encrypted dumps to third-party Google Drive / iCloud drives is non-goal (local file export/import only).
- **Resuming Goals Feature**: Finance Tracker Goals remains explicitly deferred per project guardrails.

---

## 8. Functional Requirements

### 8.1 Notifications (REQ-6.1 – REQ-6.5)
- **`REQ-6.1`**: The app shall request OS notification permissions (`POST_NOTIFICATIONS` on Android 13+, APNs authorization on iOS) using an in-app pre-permission rationale dialog.
- **`REQ-6.2`**: The app shall schedule local OS notifications for upcoming bills based on user-configured lead days (e.g. 1 day, 3 days, 7 days before due date).
- **`REQ-6.3`**: The app shall trigger local in-app event notifications when a budget exceeds 80% or 100% threshold during expense entry.
- **`REQ-6.4`**: Tapping a bill reminder or budget notification shall deep-link the user directly to the relevant bill item or budget detail screen.
- **`REQ-6.5`**: The user shall be able to configure daily reminder time and toggle notification channels individually in Settings.

### 8.2 Offline Resilience & Sync (REQ-6.6 – REQ-6.10)
- **`REQ-6.6`**: The app shall detect network state transitions in real time using `@react-native-community/netinfo`.
- **`REQ-6.7`**: When offline, transaction creations shall be queued locally in an append-only mutation repository with optimistic UI rendering.
- **`REQ-6.8`**: When network connectivity is restored, the sync engine shall auto-flush pending sync queues with exponential backoff and random jitter retry.
- **`REQ-6.9`**: Conflicts between local and remote edits shall follow entity-specific merge rules defined in `ADR-023`, avoiding silent data loss on transaction edits.
- **`REQ-6.10`**: An unobtrusive offline status indicator shall inform the user when operating in offline mode.

### 8.3 Backup & Restore (REQ-6.11 – REQ-6.15)
- **`REQ-6.11`**: The user shall be able to export a complete encrypted backup container file (`.ftb`) containing accounts, categories, transactions, budgets, and bills.
- **`REQ-6.12`**: Backup files shall be optionally encrypted using an Authenticated Encryption with Associated Data (AEAD) container format with a user-defined passphrase.
- **`REQ-6.13`**: The restore workflow shall validate schema compatibility, version numbers, and cryptographic authentication tags before applying data.
- **`REQ-6.14`**: The app shall display a preview summary (record counts by entity) prior to overwriting existing database state during restore.
- **`REQ-6.15`**: The export/import workflow shall strip sensitive authentication tokens and session keys from backup payload.

### 8.4 EAS & Production Pipeline (REQ-6.16 – REQ-6.20)
- **`REQ-6.16`**: `app.json` shall configure formal app identity (`name`, `slug`, `scheme`, `ios.bundleIdentifier`, `android.package`).
- **`REQ-6.17`**: `eas.json` shall define distinct `development`, `preview` (internal testing), and `production` profiles with environment variable binding.
- **`REQ-6.18`**: Secrets (Supabase URL, publishable key, service roles) shall be injected strictly via EAS secrets or environment files, never hardcoded.
- **`REQ-6.19`**: Android builds shall generate AAB/APK with release keystore signing configuration.
- **`REQ-6.20`**: iOS builds shall configure distribution provisioning profiles and App Store connect submission capabilities.

---

## 9. Non-Functional Requirements

- **Performance**: Notification schedule registration must complete in under 500ms; backup export generation must take under 2 seconds for 10,000 records.
- **Memory & Battery**: Local notification polling is prohibited; scheduling must leverage native OS alarm services (Android `AlarmManager` / iOS `UNUserNotificationCenter`) to minimize battery impact.
- **File Container Efficiency**: Backup payload structure must minimize overhead and achieve optimal serialization throughput.

---

## 10. Security & Privacy Requirements

- **AEAD Encryption**: Backups must use passphrase-derived keys and Authenticated Encryption with Associated Data (AEAD) to ensure confidentiality and tamper-proof integrity. Detailed derivation parameters are specified in `ADR-024`.
- **Zero Token Leakage**: Backup files must NEVER include JWT refresh tokens, API secret keys, or secure store passkeys.
- **Permission Transparency**: Notification permissions must explain the exact utility (bill due reminders) before invoking system permission modals.

---

## 11. Reliability & Offline Requirements

- **Idempotent Queue Operations**: Sync operation queue items must include unique UUIDs to prevent double-posting during network reconnection bursts.
- **Fault-Tolerant Backup Parsing**: Malformed or corrupted backup files must fail gracefully with descriptive error messages without corrupting active SQLite database tables.

---

## 12. Platform Requirements

- **Android (API 26+)**: Android 13+ runtime notification permissions (`POST_NOTIFICATIONS`), dedicated notification channels (`bill_reminders`, `budget_alerts`).
- **iOS (iOS 15+)**: `UNUserNotificationCenter` permission handling, badge count management, app state change handlers.

---

## 13. Information Architecture Impact

The following existing screens will be updated in Phase 6:

1. **`app/(tabs)/settings.tsx` (Settings Screen)**:
   - **Notification Section**: Daily reminder toggle, time picker, budget alert switch, bill reminder switch.
   - **Data & Backup Section**: Export Encrypted Backup button, Import & Restore Backup button.
   - **Network & Sync Section**: Real-time connection badge (Online / Offline), Sync Queue status, Manual Sync trigger.

2. **`app/_layout.tsx` (Root Layout)**:
   - Global Notification Response listener for deep-linking.
   - Network connectivity banner host.

---

## 14. Architectural Decision Candidates (ADRs to create in Phase 6.7)

1. **`ADR-022`**: `Expo Local Notifications & Scheduling Architecture`
2. **`ADR-023`**: `Offline Network Status Provider & Sync Engine Architecture`
3. **`ADR-024`**: `Encrypted Local Backup Container (.ftb) & Migration Specification`
4. **`ADR-025`**: `EAS Multi-Profile Build & Release Configuration Strategy`

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Android 13+ Permission Denial** | Notifications fail silently | Implement pre-permission rationale modal with fallback in-app banner |
| **Database Corruption during Restore** | Data loss | Wrap restore in single atomic SQLite transaction; generate safety backup prior to restore |
| **Supabase Rate-Limiting on Reconnection** | Sync failures | Implement exponential backoff with jitter in `SupabaseSyncTransportProvider` |
| **Missing iOS Provisioning Certificates** | Build failure on EAS | Document step-by-step EAS Credentials auto-management workflow |

---

## 16. Requirement Traceability Matrix

| Requirement | Source Problem / Goal | Target Component / Layer |
|---|---|---|
| REQ-6.1 – REQ-6.5 | Missed bill dates / Budget overflows | `src/platform/notifications/`, `SettingsScreen` |
| REQ-6.6 – REQ-6.10 | Network dropouts / Sync stalls | `src/platform/persistence/sync/`, `SyncModule` |
| REQ-6.11 – REQ-6.15 | Device lock-in / Data loss | `src/features/backup/`, `SettingsScreen` |
| REQ-6.16 – REQ-6.20 | Build configuration vulnerabilities | `app.json`, `eas.json`, CI/CD pipeline |

---

## 17. Investigation Findings Summary

1. **Domain Abstractions Exist**: `NotificationSettings` VO and `INetworkStatusProvider` port were created in earlier phases, simplifying clean architecture integration.
2. **Dependencies Needed**: `expo-notifications`, `@react-native-community/netinfo`, `expo-file-system`, and `expo-document-picker` must be added cleanly without breaking existing Expo SDK 55 locks.
3. **Configuration Standardization Required**: `app.json` requires metadata cleanup (renaming `mobile_temp` to `Finance Tracker` and adding iOS bundle identifier).

---

## 18. Open Product Decisions

1. **Default Notification Lead Time**: Bill due reminders default to 3 days before due date with option for 1-day second reminder.
2. **Backup Container Extension**: Backup files shall use the `.ftb` extension.

---

## 19. Next Lifecycle Stage

Following approval of Phase 6 Discovery, the project moves to:
**Phase 6 Stage 2 — Information Architecture & Scope Boundary**.

---

## 20. Approval Gate

```text
==================================================
PHASE 6 DISCOVERY STATUS: APPROVED & FROZEN 🔒
==================================================
```

*Note: Phase 6 Discovery has incorporated all review requirements. No production code has been modified or implemented. Ready to proceed to Phase 6 Information Architecture & Scope Boundary.*
