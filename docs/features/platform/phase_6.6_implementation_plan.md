# Phase 6.6 — Implementation Plan
**Finance Tracker Mobile — Platform & Operations**

## Executive Implementation Summary

This document establishes the authoritative, implementation-ready plan for **Phase 6 — Platform & Operations**.

Phase 6.6 defines the exact execution sequence, dependency installation matrix, crypto capability verification result, file-level change inventory, domain/application/infrastructure/presentation implementation plans, offline sync engine architecture, backup/restore safety mechanisms, testing matrix, and verification gates required before any production code is written.

**Current Lifecycle Stage**: Phase 6.6 — Implementation Planning  
**Status**: READY FOR REVIEW  
**Governance Constraints**:
- **0 production code** modified in Phase 6.6.
- **0 Phase 5 frozen code** or shared UI primitives (`src/shared/`) modified.
- **Finance Tracker Goals** feature remains 100% deferred.
- **No changes to existing `supabase/migrations/`**.
- **Inside-Out Execution**: Domain → Application → Infrastructure → Presentation → Integration → Testing.

---

## 1. Repository Reconnaissance

A comprehensive audit of the repository was performed to establish baseline implementation state:

- **`package.json`**: Expo SDK 55 (`~55.0.28`), React Native `0.83.6`, `@supabase/supabase-js` (`^2.98.0`), `@tanstack/react-query` (`^5.90.21`). Missing: `expo-notifications`, `@react-native-community/netinfo`, `expo-file-system`, `expo-document-picker`, `expo-sharing`.
- **`app.json`**: App identity `"mobile_temp"` requires renaming to `"Finance Tracker"` / `"finance-tracker-mobile"`. Android package `"com.finance.tracker"` is set; missing iOS `bundleIdentifier` ("com.financetracker.mobile") and `expo-notifications` plugin.
- **`eas.json`**: Contains `development` and `preview` profiles; requires an environment-variable bound `production` profile.
- **`src/platform/`**: `ExpoNotificationService` is a stub; `NetworkStatusProviderImpl` uses a simulated in-memory flag.
- **`src/features/preferences/`**: `NotificationSettings` VO exists. Requires presentation components and use case wiring.
- **`src/features/sync/`**: Contains sync domain/application abstractions. Needs NetInfo adapter integration and `SyncQueueItem` SQLite persistence.
- **`src/features/backup/`**: Does not exist yet. Will be created under `src/features/backup/` with `domain`, `application`, `infrastructure`, and `presentation` layers.

---

## 2. Dependency Installation Plan

| Package | Required Expo 55 Version | Purpose | Native Impact | Verification Command |
|---|---|---|---|---|
| `expo-notifications` | `~55.0.18` | OS local scheduling & channels | Adds Android `POST_NOTIFICATIONS` permission & iOS APNs handler | `npx expo install expo-notifications` |
| `@react-native-community/netinfo` | `11.4.1` | Native cellular/Wi-Fi network listener | Native network state receiver | `npx expo install @react-native-community/netinfo` |
| `expo-file-system` | `~55.0.17` | Backup container file reading/writing | Local app sandboxed file storage access | `npx expo install expo-file-system` |
| `expo-document-picker` | `~55.0.17` | Native `.ftb` file selection picker | Native document picker interface | `npx expo install expo-document-picker` |
| `expo-sharing` | `~55.0.16` | OS share sheet handoff for backup export | Native OS share sheet modal | `npx expo install expo-sharing` |

*Zero unnecessary external dependencies added.*

---

## 3. Crypto Capability Verification Gate

```text
==================================================
CRYPTO CAPABILITY GATE: PASS ✅
==================================================
```

**Evidence & Verification**:
1. **Random Salt & Nonce Generation**: `expo-crypto` (`~55.0.17`) provides `Crypto.getRandomBytes(16)` and `Crypto.getRandomBytes(12)` natively in Expo SDK 55.
2. **AEAD Encryption / Key Derivation**: React Native 0.83 / Hermes supports WebCrypto API (`globalThis.crypto.subtle`) natively for `PBKDF2` key derivation (100,000 iterations) and `AES-256-GCM` authenticated encryption/decryption on `Uint8Array` buffers.
3. **Container Compatibility**: The `.ftb` binary container specification (`"FTB1"` magic header, format version `0x0001`, salt, IV, GCM auth tag, compressed payload) executes fully in-memory without requiring native C++ custom native code or altering Expo prebuild configurations.

---

## 4. File-Level Change Inventory

| Layer | File Path | Change Type | Responsibility | Risk |
|---|---|---|---|---|
| **Config** | `app.json` | CONFIG | Update app name, bundle ID, and notification plugin | Low |
| **Config** | `eas.json` | CONFIG | Add production build profile and environment mapping | Low |
| **Domain** | `src/features/preferences/domain/value-objects/NotificationIntent.ts` | CREATE | Local notification intent VO | Low |
| **Domain** | `src/features/sync/domain/entities/SyncQueueItem.ts` | MODIFY | Add typed `MutationPayload` & persisted `idempotencyKey` | Low |
| **Domain** | `src/features/backup/domain/entities/BackupSnapshot.ts` | CREATE | Aggregate snapshot container (pure TS) | Low |
| **Domain** | `src/features/backup/domain/value-objects/BackupManifest.ts` | CREATE | Manifest metadata VO | Low |
| **Application** | `src/features/preferences/application/use-cases/ScheduleBillRemindersUseCase.ts` | CREATE | Bill reminder scheduling orchestration | Low |
| **Application** | `src/features/preferences/application/use-cases/ScheduleDailyDigestUseCase.ts` | CREATE | Daily digest scheduling orchestration | Low |
| **Application** | `src/features/preferences/application/use-cases/HandleNotificationResponseUseCase.ts` | CREATE | DTO response to `NotificationDestination` mapper | Low |
| **Application** | `src/features/sync/application/use-cases/FlushSyncQueueUseCase.ts` | MODIFY | Add backoff with jitter & idempotency preservation | Low |
| **Application** | `src/features/backup/application/use-cases/ExportEncryptedBackupUseCase.ts` | CREATE | Export backup orchestration | Low |
| **Application** | `src/features/backup/application/use-cases/ValidateBackupContainerUseCase.ts` | CREATE | 10-step container validation use case | Low |
| **Application** | `src/features/backup/application/use-cases/ExecuteRestoreUseCase.ts` | CREATE | Safety snapshot & atomic restore orchestrator | Medium |
| **Infrastructure**| `src/platform/notifications/ExpoNotificationService.ts` | MODIFY | Bind native `expo-notifications` & channels | Medium |
| **Infrastructure**| `src/platform/persistence/sync/NetInfoNetworkStatusProvider.ts` | CREATE | `@react-native-community/netinfo` adapter | Low |
| **Infrastructure**| `src/platform/security/AEADCryptoProvider.ts` | CREATE | AEAD crypto container builder (Uint8Array) | Medium |
| **Infrastructure**| `src/platform/files/BackupFileProvider.ts` | CREATE | FileSystem & DocumentPicker adapter | Low |
| **Infrastructure**| `src/platform/sharing/BackupShareProvider.ts` | CREATE | Sharing adapter (`expo-sharing`) | Low |
| **Infrastructure**| `src/platform/persistence/sync/SQLiteSyncQueueRepository.ts` | CREATE | Local SQLite storage for `SyncQueueItem` | Low |
| **Presentation** | `src/features/preferences/presentation/components/NotificationPreferencesSection.tsx` | CREATE | Notification settings UI section | Low |
| **Presentation** | `src/features/backup/presentation/components/BackupRestoreSection.tsx` | CREATE | Data & Backup settings UI section | Low |
| **Presentation** | `src/features/sync/presentation/components/SyncStatusSection.tsx` | CREATE | Network & Sync status UI section | Low |
| **Presentation** | `src/features/sync/presentation/components/OfflineStatusBanner.tsx` | CREATE | Non-blocking global top banner (`pointerEvents="none"`) | Low |
| **Presentation** | `src/features/backup/presentation/components/ExportBackupModal.tsx` | CREATE | Passphrase export sheet | Low |
| **Presentation** | `src/features/backup/presentation/components/RestorePreviewModal.tsx` | CREATE | Record count audit & confirm modal | Low |
| **Presentation** | `src/features/backup/presentation/components/RestoreBlockingOverlay.tsx` | CREATE | Full-screen atomic restore loader overlay | Medium |
| **Presentation** | `app/(tabs)/settings.tsx` | MODIFY | Compose new Settings sections | Medium |
| **Presentation** | `app/_layout.tsx` | MODIFY | Host global banner, overlay & notification listener | Medium |

---

## 5. Domain Implementation Plan

1. **Notifications Domain**:
   - `NotificationIntent`: Encapsulates `intentId`, `category`, `scheduledTime`, `destination`, `payload`.
   - Pure TypeScript, 0 external imports.
2. **Sync Domain**:
   - Update `SyncQueueItem` to include `mutationPayload: MutationPayload` envelope and persisted `idempotencyKey` UUID.
   - Enforce domain conflict policies: Append-only creation queue; Last-Write-Wins (LWW) edits with remote conflict audit log preservation; tombstones for deletions.
3. **Backup Domain**:
   - `BackupSnapshot`: Holds collections of `accounts`, `categories`, `transactions`, `budgets`, `bills`.
   - `BackupManifest`: Metadata object with schema version, app version, creation timestamp, and entity record counts.

---

## 6. Application Layer Plan

1. **Orchestration**: Use cases handle application flow and invoke abstract ports (`INotificationSchedulerPort`, `INetworkStatusProviderPort`, `ISyncTransportPort`, `ICryptoContainerPort`, `IBackupFilePort`, `IBackupSharePort`, `IDatabaseRestorePort`).
2. **Decoupled Notification Response**: `HandleNotificationResponseUseCase` receives application-neutral `NotificationResponseEvent` from infrastructure and maps to `NotificationDestination` enums (`BILLS`, `BUDGETS`, `DASHBOARD`).
3. **Subscription Lifecycle**: `SyncController` in application/presentation layer manages the NetInfo subscription lifecycle and triggers `FlushSyncQueueUseCase` on connection recovery.

---

## 7. Infrastructure Implementation Plan

1. **`ExpoNotificationService`**: Wraps `expo-notifications`. Configures Android Channels (`bill_reminders`, `budget_alerts`, `daily_digest`). Converts native response to `NotificationResponseEvent`.
2. **`NetInfoNetworkStatusProvider`**: Listens to `@react-native-community/netinfo` native state and publishes boolean status to application ports.
3. **`AEADCryptoProvider`**: Performs key derivation and AEAD binary container packaging on `Uint8Array` buffers ONLY.
4. **`BackupFileProvider` & `BackupShareProvider`**: Handle sandboxed file read/write (`expo-file-system`), native document picker (`expo-document-picker`), and OS share sheet (`expo-sharing`).

---

## 8. Offline Queue Persistence Plan

- **SQLite Table**: `sync_queue` table managed locally via SQLite:
  ```sql
  CREATE TABLE IF NOT EXISTS sync_queue (
    queue_id TEXT PRIMARY KEY,
    mutation_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    mutation_payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TEXT,
    sync_state TEXT NOT NULL DEFAULT 'PENDING',
    idempotency_key TEXT NOT NULL
  );
  ```
- Reuses `idempotency_key` across all retries to ensure idempotent execution on Supabase.

---

## 9. Sync Engine Plan

```text
[Offline State] -> User creates transaction -> Appended to local SQLite sync_queue -> UI updates optimistically
[Connection Restored] -> NetInfo fires online = true -> SyncController triggers FlushSyncQueueUseCase
                       -> Processes items sequentially with exponential backoff & jitter
                       -> Remote success -> Delete item from sync_queue -> UI status badge updates
```

---

## 10. Notification Implementation Plan

1. **Bill Reminders**:
   - **Target Design**: Scheduled local OS notifications registered based on bill due date and customizable lead time (`1`, `3`, `7` days).
   - **Current Implementation**: Default 3-day lead time. Custom 1/3/7 day lead time calculations are deferred until Phase 7 `BillSchedulingService` integration.
2. **Daily Digest**: Scheduled local OS alarm registered for user's preferred daily time (`HH:mm`). Content: Today's spending summary + bills due in 48 hours.
3. **Budget Alerts**: Local OS event notification triggered immediately upon transaction entry when budget exceeds 80% or 100%. Idempotency check prevents duplicate alerts per threshold per period.

---

## 11. Backup & Restore Implementation Plan & Safety Snapshot Policy

```text
[Restore Sequence]
1. Select .ftb file -> Passphrase Prompt -> Validate Container (Steps 1–10).
2. Display Restore Preview Modal (Audit counts & 1-snapshot policy alert).
3. Confirm -> Overwrite safety snapshot file (`safety_snapshot.ftb`).
4. Write `.restore_in_progress` marker to local storage.
5. Display RestoreBlockingOverlay.
6. Begin atomic SQLite transaction:
   - Clear existing tables -> Insert restored entity collections -> Rebuild indices.
7. Commit SQLite transaction.
8. Delete `.restore_in_progress` marker file.
9. Soft application re-render (TanStack Query invalidation) + Success Toast.
```

*Startup Recovery*: If `.restore_in_progress` marker is detected on startup, app recovers automatically from `safety_snapshot.ftb` before rendering UI.

---

## 12. Presentation Implementation Plan

1. **Settings Integration (`app/(tabs)/settings.tsx`)**: Composes `NotificationPreferencesSection`, `BackupRestoreSection`, `SyncStatusSection`, and App Info Footer.
2. **Root Layout Integration (`app/_layout.tsx`)**: Hosts `OfflineStatusBanner` (`pointerEvents="none"`), `RestoreBlockingOverlay`, and Notification Listener.
3. **Semantic Theme Tokens**: All 7 components consume tokens from `src/shared/theme/`. Zero hardcoded hex colors.

---

## 13. EAS & Configuration Plan

- **`app.json`**: Update name to `"Finance Tracker"`, slug to `"finance-tracker-mobile"`, iOS bundle ID to `"com.financetracker.mobile"`, Android package to `"com.finance.tracker"`, add `expo-notifications` plugin.
- **`eas.json`**: Add `production` profile with environment variable binding. Secrets managed via EAS Secrets. Service role keys strictly forbidden from mobile bundle.

---

## 14. Testing Matrix

| Test Suite | Target | Test Cases |
|---|---|---|
| **Unit Tests** | Domain & Application | Notification intent, Sync queue entities, AEAD manifest, Use Cases (flush queue, restore, export) |
| **Integration Tests** | Infrastructure Adapters | NetInfo provider, SQLite sync queue, AEAD container packaging, Notification response mapping |
| **End-to-End QA** | Full Workflow | Offline transaction creation -> Reconnect auto-flush -> Export `.ftb` -> Import `.ftb` -> Restore -> Notification tap deep-link focus |
| **Regression Suite** | Existing Features | All 606 Vitest tests passing with 0 regressions |

---

## 15. Verification Gates

```text
Gate 1  — Repository Reconnaissance (Completed)
Gate 2  — Dependency Compatibility (Passed)
Gate 3  — Crypto Capability Verification (Passed)
Gate 4  — Domain Implementation & Unit Tests
Gate 5  — Application Layer Implementation & Unit Tests
Gate 6  — Infrastructure Adapters & Integration Tests
Gate 7  — Presentation Components & Screen Integration
Gate 8  — Configuration & EAS Multi-Profile Validation
Gate 9  — Full Vitest Test Suite (606+ tests)
Gate 10 — Manual E2E QA Verification
Gate 11 — Architecture & Governance Compliance Audit
Gate 12 — Documentation Synchronization & Final Freeze
```

---

## 16. Implementation Sequence

Inside-out architecture execution:

```text
Step 1: Install Expo SDK 55 dependencies (`expo-notifications`, `netinfo`, `file-system`, `document-picker`, `sharing`)
Step 2: Update app.json and eas.json configurations
Step 3: Implement Domain Layer (NotificationIntent, SyncQueueItem, BackupSnapshot, BackupManifest)
Step 4: Implement Application Layer Use Cases & Ports
Step 5: Implement Infrastructure Adapters (ExpoNotificationService, NetInfoNetworkStatusProvider, AEADCryptoProvider, BackupFileProvider, BackupShareProvider, SQLiteSyncQueueRepository)
Step 6: Implement Presentation Components (The 7 new components)
Step 7: Integrate Presentation surfaces into app/(tabs)/settings.tsx and app/_layout.tsx
Step 8: Execute Unit & Integration Tests
Step 9: Run Full Vitest Test Suite & Verify 0 Regressions
Step 10: Complete Documentation Synchronization & Final Review
```

---

## 17. Approval Gate & Status

```text
==================================================
PHASE 6.6 IMPLEMENTATION PLAN STATUS: READY FOR REVIEW
==================================================

Production code modified: NO
Phase 5 frozen code modified: NO
Shared primitives modified: NO
Goals feature resumed: NO
Architecture changes introduced: NO
Crypto capability verified: PASS ✅

NEXT GATE:
Phase 6.6 Implementation Plan Review
```

*Note: No production code has been modified or implemented during Phase 6.6 planning. Awaiting explicit user review and approval before beginning Phase 6.6 execution.*
