# Phase 6.5 — Architecture Specification & ADR Review
**Finance Tracker Mobile — Platform & Operations**

## Executive Summary & Status

This document specifies the authoritative **Architecture Specification and Architecture Decision Records (ADR-022 through ADR-025)** for **Phase 6 — Platform & Operations**.

Phase 6.5 translates the approved Phase 6 Discovery (`REQ-6.1` – `REQ-6.20`), Phase 6.1 Information Architecture, Phase 6.2 Wireframes, Phase 6.3 Design Review, and Phase 6.4 Design System into a Clean Architecture specification across Domain, Application, Infrastructure, Presentation, and Integration layers.

**Current Lifecycle Stage**: Phase 6.5 — Architecture Specification & ADR Review  
**Status**: APPROVED & FROZEN 🔒 (Post-Revision Synchronization)  
**Governance Constraints**:
- **0 production code** implemented.
- **0 Phase 5 frozen code** or shared UI primitives (`src/shared/`) modified.
- **Finance Tracker Goals** feature remains 100% deferred.
- **Clean Architecture Enforcement**: Domain is 100% framework-independent (0 dependencies on React Native, Expo, Supabase, SQLite, or crypto libraries).

---

## 1. Domain Architecture

Domain models encapsulate core business rules and value objects without framework dependencies.

### 1.1 Notifications Domain
- **`NotificationSettings`**: Pre-existing aggregate VO preserving `billRemindersEnabled`, `billReminderLeadTimeDays` (`1 | 3 | 7`), `budgetAlertsEnabled`, `dailyDigestEnabled`, and `dailyDigestTime` (`ReminderTime`).
- **`NotificationIntent`**: Value object encapsulating scheduling intent:
  - `intentId`: string (UUID)
  - `category`: `'BILL_DUE_REMINDER' | 'BUDGET_THRESHOLD_ALERT' | 'DAILY_DIGEST'`
  - `scheduledTime`: Date
  - `destination`: `NotificationDestination`
  - `payload`: Record<string, unknown>

### 1.2 Offline Sync Domain & Typed Mutation Envelopes
- **Typed Mutation Envelopes**:
  ```typescript
  export type MutationPayload =
    | { entityType: 'TRANSACTION'; data: TransactionMutationDTO }
    | { entityType: 'BILL'; data: BillMutationDTO }
    | { entityType: 'BUDGET'; data: BudgetMutationDTO }
    | { entityType: 'CATEGORY'; data: CategoryMutationDTO }
    | { entityType: 'ACCOUNT'; data: AccountMutationDTO };
  ```
- **`SyncQueueItem`**: Entity representing a queued local mutation:
  - `queueId`: string (UUID)
  - `mutationType`: `'CREATE' | 'UPDATE' | 'DELETE'`
  - `mutationPayload`: MutationPayload
  - `entityId`: string
  - `createdAt`: Date
  - `retryCount`: number
  - `lastAttemptAt`: Date | null
  - `syncState`: `'PENDING' | 'SYNCING' | 'FAILED'`
  - `idempotencyKey`: string (client-generated UUID, persisted & reused across retries)

### 1.3 Detailed Conflict Resolution Policy (ADR-023)
- **Transactions**:
  - `CREATE`: Append-only queue with client-generated UUID. Guarantees zero data loss during offline recording.
  - `UPDATE`: Timestamp-based Last-Write-Wins (LWW). If client timestamp > server timestamp, update applies. If client timestamp <= server timestamp, conflict is raised; local version is preserved in local audit log rather than silently overwritten. If timestamps are equal or missing, local version is preserved with an unverified conflict flag.
  - `DELETE`: Soft deletion via tombstone flag (`is_deleted: true`).
- **Bills & Budgets**: Server-authoritative with timestamp LWW.
- **Categories & Accounts**: Immutable ID binding; remote sync updates metadata.

### 1.4 Backup Domain
- **`BackupManifest`**: Value object summarizing snapshot metadata (`manifestVersion`, `createdAt`, `appVersion`, `schemaVersion`, `entityCounts`).
- **`BackupSnapshot`**: Aggregate domain container holding record collections: `accounts`, `categories`, `transactions`, `budgets`, `bills`. (Zero knowledge of files, path strings, `.ftb`, SQLite, passwords, or encryption).

---

## 2. Application Architecture

Application layer orchestrates use cases and defines abstract ports for infrastructure implementations.

### 2.1 Notifications Application Layer
- **Use Cases**:
  - `RequestNotificationPermissionUseCase`: Requests OS permission using pre-permission rationale logic.
  - `ScheduleBillRemindersUseCase`: Queries upcoming bills and registers local OS alarm schedules.
  - `ScheduleDailyDigestUseCase`: Registers daily OS alarm at user's preferred time (`HH:mm`).
  - `CancelNotificationScheduleUseCase`: Cancels OS scheduled notifications when toggled off.
  - `HandleBudgetThresholdNotificationUseCase`: Triggered by transaction entry events when budget reaches 80% or 100%.
  - `HandleNotificationResponseUseCase`: Receives application-neutral `NotificationResponseEvent` from infrastructure and maps to `NotificationDestination`.
- **Ports (Interfaces)**:
  - `INotificationSchedulerPort`: `scheduleLocalNotification(intent: NotificationIntent): Promise<void>`, `cancelAllNotifications(): Promise<void>`.
  - `INotificationPermissionPort`: `checkPermissionStatus(): Promise<PermissionStatus>`, `requestPermission(): Promise<PermissionStatus>`.
  - `INotificationResponsePort`: `subscribeResponseEvents(handler: (event: NotificationResponseEvent) => void): () => void`.

### 2.2 Synchronization Application Layer
- **Use Cases**:
  - `ObserveNetworkStatusUseCase`: Exposes network connection observation stream. (Subscription lifecycle owned by application `SyncController`).
  - `QueueOfflineMutationUseCase`: Appends new mutation items with persisted `idempotencyKey` to local sync queue.
  - `FlushSyncQueueUseCase`: Flushes pending mutations using exponential backoff and jitter.
  - `ReconcileSyncConflictUseCase`: Resolves conflict items against entity merge rules.
- **Ports (Interfaces)**:
  - `INetworkStatusProviderPort`: `isOnline(): Promise<boolean>`, `subscribe(listener: (online: boolean) => void): () => void`.
  - `ISyncQueueRepositoryPort`: `enqueue(item: SyncQueueItem): Promise<void>`, `getPendingItems(): Promise<SyncQueueItem[]>`, `markSyncState(...)`.
  - `ISyncTransportPort`: `executeRemoteMutation(item: SyncQueueItem): Promise<SyncTransportResult>`.

### 2.3 Backup & Restore Application Layer
- **Use Cases**:
  - `ExportEncryptedBackupUseCase`: Serializes domain snapshot, invokes `ICryptoContainerPort`, and triggers file export.
  - `ValidateBackupContainerUseCase`: Decrypts AEAD container, validates checksums, manifest, and schema compatibility.
  - `ExecuteRestoreUseCase`: Creates safety snapshot, enters global blocking state, executes atomic SQLite replacement, and soft re-renders app state.
- **Ports (Decoupled Infrastructure Interfaces)**:
  - `ICryptoContainerPort`: `encryptPayload(data: Uint8Array, passphrase?: string): Promise<EncryptedContainerBytes>`, `decryptContainer(bytes: Uint8Array, passphrase?: string): Promise<Uint8Array>`.
  - `IBackupFilePort`: `writeBackupFile(filename: string, bytes: Uint8Array): Promise<string>`, `readBackupFile(uri: string): Promise<Uint8Array>`, `pickBackupFile(): Promise<string | null>`.
  - `IBackupSharePort`: `shareFile(fileUri: string): Promise<void>`.
  - `IDatabaseRestorePort`: `createSafetySnapshot(): Promise<void>`, `restoreDatabase(snapshot: BackupSnapshot): Promise<void>`, `rollbackSafetySnapshot(): Promise<void>`.

---

## 3. Infrastructure Architecture

Infrastructure layer splits responsibilities into single-purpose, decoupled adapters.

### 3.1 `ExpoNotificationService` (Notifications Adapter)
- **Location**: `src/platform/notifications/ExpoNotificationService.ts`
- **Dependencies**: `expo-notifications`
- **Responsibilities**: Maps `NotificationIntent` to `Notifications.scheduleNotificationAsync`, configures Android Channels (`bill_reminders`, `budget_alerts`, `daily_digest`). Converts native notification response objects into application-neutral `NotificationResponseEvent` DTOs. Does NOT emit `NotificationDestination` or Expo Router routes directly.

### 3.2 `NetInfoNetworkStatusProvider` (Network Adapter)
- **Location**: `src/platform/persistence/sync/NetInfoNetworkStatusProvider.ts`
- **Dependencies**: `@react-native-community/netinfo`
- **Responsibilities**: Replaces simulated network status provider. Listens to native cellular/Wi-Fi connection state and emits boolean status changes to `INetworkStatusProviderPort`.

### 3.3 `SupabaseSyncTransportProvider` (Sync Transport Adapter)
- **Location**: `src/platform/persistence/sync/SupabaseSyncTransportProvider.ts`
- **Dependencies**: `@supabase/supabase-js`
- **Responsibilities**: Executes remote RPC calls reusing persisted `SyncQueueItem.idempotencyKey` across retries. Implements exponential backoff (`baseDelay * 2^attempt + randomJitter`).

### 3.4 Decoupled Backup & Crypto Adapters
- **`AEADCryptoProvider`** (`src/platform/security/AEADCryptoProvider.ts`):
  - Responsibilities: Crypto container packaging and key derivation ONLY. Operates on byte arrays (`Uint8Array`). Zero file-system or share-sheet dependencies.
  - **Implementation Status**:
    - **Target Architecture**: `PBKDF2` + `AES-256-GCM` authenticated encryption container format (`.ftb`).
    - **Current Implementation**: Explicitly deferred adapter boundary. Attempting payload encryption/decryption throws explicit safety errors. Production-safe native AEAD payload encryption is deferred until native platform crypto module integration.
- **`BackupFileProvider`** (`src/platform/files/BackupFileProvider.ts`):
  - Responsibilities: File system operations (`expo-file-system`) and native document picking (`expo-document-picker`) ONLY.
- **`BackupShareProvider`** (`src/platform/sharing/BackupShareProvider.ts`):
  - Responsibilities: OS share sheet handoff (`expo-sharing`) ONLY.

---

## 4. Backup Container Architecture (`.ftb` Format)

### 4.1 `.ftb` Binary Container Specification
```text
+-----------------------------------------------------------------------+
|  MAGIC HEADER: "FTB1" (4 bytes ASCII)                                 |
|  FORMAT VERSION: 0x0001 (2 bytes uint16)                              |
|  ALGORITHM ID: 0x01 (AEAD Container) (1 byte)                         |
|  KDF ITERATIONS: uint32 (Verification Gate)                            |
|  SALT: 16 bytes random salt                                           |
|  NONCE / IV: 12 bytes random GCM IV                                   |
|  AUTHENTICATION TAG: 16 bytes GCM auth tag                            |
|  PAYLOAD LENGTH: uint32                                               |
|  ENCRYPTED PAYLOAD: JSON Snapshot Data (Compressed)                   |
+-----------------------------------------------------------------------+
```

### 4.2 Ten-Step Validation Order
1. **Magic Header Check**: Must equal `"FTB1"`.
2. **Format Version Check**: Supported by current app release.
3. **Algorithm ID Check**: Supported container format ID (`0x01`).
4. **KDF Metadata Validation**: Iterations & salt length within policy limits.
5. **Passphrase Prompt / Key Derivation**: Derive key via AEAD provider.
6. **AEAD Authentication & Decryption**: Verify authentication tag before payload decryption.
7. **Decompression & Payload Parsing**: Decompress & parse JSON snapshot.
8. **Schema Version Check**: Verify snapshot schema against active migrations.
9. **Manifest Audit**: Extract entity counts for pre-restore preview modal.
10. **Destination Verification**: Confirm SQLite writable before transaction start.

If ANY step fails, decryption halts immediately. Active SQLite database is NEVER modified during validation.

---

## 5. Restore Safety Architecture & Rollback Mechanics

The restore workflow clearly separates **SQLite Transaction Rollback** from **Safety Snapshot Rollback**:

```text
[Step 1] Validate backup container completely (Steps 1–10 above).
[Step 2] Present Restore Preview Modal (Audit & 1-snapshot warning).
[Step 3] Require explicit user confirmation ("Confirm & Overwrite").
[Step 4] Overwrite local safety snapshot file (`safety_snapshot.ftb`) with current database state.
[Step 5] Write active marker `.restore_in_progress` to local file storage.
[Step 6] Trigger RestoreBlockingOverlay (Full-screen non-dismissable loader).
[Step 7] Begin atomic SQLite transaction:
          a. Clear existing application tables (transactions, accounts, budgets, bills, categories).
          b. Insert restored entity collections from BackupSnapshot.
          c. Rebuild search FTS indices and aggregate balances.
[Step 8] Commit SQLite transaction.
          - If transaction aborts BEFORE commit: SQLite rolls back automatically in-memory.
          - Active database remains 100% untouched.
[Step 9] Delete `.restore_in_progress` marker file.
[Step 10] Trigger soft application re-render (Re-query TanStack Query caches).
[Step 11] Dismiss RestoreBlockingOverlay.
[Step 12] Present Success Toast ("Database restored successfully").
```

*Startup Recovery Contract*: If `.restore_in_progress` marker exists on app startup (indicating unexpected process kill during SQLite write), startup boot recovers the database automatically from `safety_snapshot.ftb` before rendering UI.

---

## 6. Presentation Architecture

Presentation components consume pure ViewModels and emit action callbacks.

```text
Presentation Layer Architecture
├── SettingsScreen (app/(tabs)/settings.tsx)
│   ├── NotificationPreferencesSection
│   ├── BackupRestoreSection
│   └── SyncStatusSection
├── Global UI (app/_layout.tsx)
│   ├── OfflineStatusBanner (pointerEvents="none")
│   └── RestoreBlockingOverlay
├── Modals & Sheets
│   ├── ExportBackupModal
│   └── RestorePreviewModal
└── Controllers & Coordinators
    ├── SettingsController
    ├── SyncController (Owns NetInfo subscription lifecycle)
    ├── ExportBackupController
    └── RestoreBackupController
```

Presentation components contain ZERO Supabase, SQLite, native notification, or crypto logic.

---

## 7. Integration Architecture

Module integration uses explicit event listeners and application-neutral DTOs:

```text
[System Event: OS Notification Tapped]
  └─> ExpoNotificationService converts native notification to NotificationResponseEvent
      └─> Application HandleNotificationResponseUseCase processes event
          └─> Resolves NotificationDestination (BILLS / BUDGETS / DASHBOARD)
              └─> Presentation Router maps destination to Expo Router path (/bills, /budgets)

[Application Event: Transaction Created]
  └─> TransactionModule raises TransactionCreatedDomainEvent
      ├─> SyncModule queues SyncQueueItem (if offline, preserving idempotencyKey)
      └─> NotificationModule evaluates budget limit -> triggers local OS event notification (if >= 80%)

[System Event: NetInfo Connection Restored]
  └─> NetInfoNetworkStatusProvider emits isOnline = true
      └─> SyncController triggers FlushSyncQueueUseCase with exponential backoff & jitter

[Application Event: Database Restore Completed]
  └─> RestoreModule completes SQLite commit & clears .restore_in_progress marker
      └─> Emits DatabaseRestoredEvent
          └─> React Query invalidates all query caches -> Triggers soft app re-render
```

---

## 8. ADR-022 — LOCAL NOTIFICATIONS ARCHITECTURE

```text
ADR-022: Local OS Notifications & Scheduling Architecture
--------------------------------------------------
Context:
Users need timely bill due reminders, daily spending digests, and budget threshold alerts. Dedicated remote push notification servers (APNs/FCM) introduce unnecessary server infrastructure, privacy risks, and cloud costs.

Decision:
1. Implement notifications strictly as local OS scheduled and local event-triggered notifications via `expo-notifications`. Dedicated APNs/FCM push servers are EXCLUDED.
2. Configure dedicated Android channels: `bill_reminders` (High importance), `budget_alerts` (High importance), `daily_digest` (Default importance).
3. `ExpoNotificationService` translates native notification responses into application-neutral `NotificationResponseEvent` DTOs.
4. Application layer resolves target `NotificationDestination` enums (`BILLS`, `BUDGETS`, `DASHBOARD`), keeping domain/application decoupled from Expo Router string paths.
5. OS permissions use an in-app rationale modal before requesting native system permissions.

Consequences:
- Zero server infrastructure or push notification costs.
- Decoupled application navigation.
```

---

## 9. ADR-023 — OFFLINE SYNC ENGINE & MUTATION QUEUE ARCHITECTURE

```text
ADR-023: Offline Network Status Provider & Sync Engine Architecture
--------------------------------------------------
Context:
The application must support reliable offline transaction creation and graceful background sync when network connectivity transitions.

Decision:
1. Replace simulated network status provider with `@react-native-community/netinfo` adapter. Subscription lifecycle owned by application `SyncController`.
2. Offline mutations use typed envelopes (`MutationPayload`) and client-generated `idempotencyKey` UUIDs persisted and reused across retries.
3. Sync queue flushing uses exponential backoff with random jitter.
4. Conflict Policy:
   - Transactions: Append-only creation queue; edits use LWW timestamp checks (remote conflicts preserved in local audit log); deletions use tombstone flags (`is_deleted: true`). Equal/missing timestamps preserve local version with conflict flag.
   - Bills & Budgets: Server-authoritative with timestamp LWW.
5. Non-blocking `OfflineStatusBanner` uses native `pointerEvents="none"`.

Consequences:
- Fail-safe offline transaction recording without silent data loss.
```

---

## 10. ADR-024 — ENCRYPTED BACKUP CONTAINER (.ftb) & SAFETY POLICY

```text
ADR-024: Encrypted Local Backup Container (.ftb) & Restore Safety Policy
--------------------------------------------------
Context:
Users require local data portability and backup/restore capabilities without compromising privacy or risking database corruption.

Decision:
1. Define encrypted AEAD backup container format (`.ftb`). Split infrastructure into single-responsibility adapters: `AEADCryptoProvider`, `BackupFileProvider`, `BackupShareProvider`.
2. Crypto Verification Gate: The AEAD container contract is frozen in Phase 6.5. Concrete cryptographic primitive execution (`PBKDF2` + `AES-GCM` pipeline in Expo SDK 55 environment) is an explicit Phase 6.6 verification gate.
3. Container includes magic header ("FTB1"), manifest, and authentication tag for tamper detection.
4. Restore Safety Policy: Overwrites local safety snapshot (`safety_snapshot.ftb`) retaining EXACTLY ONE latest pre-restore snapshot. Uses `.restore_in_progress` marker for startup recovery.
5. SQLite failures execute in-memory transaction rollback. Successful restore completion triggers automatic soft app re-render + success toast.

Consequences:
- Clear separation of crypto, file, and share responsibilities.
- Tamper-proof, privacy-first local database backups.
```

---

## 11. ADR-025 — EAS MULTI-PROFILE BUILD & RELEASE STRATEGY

```text
ADR-025: EAS Multi-Profile Build & Secret Classification Strategy
--------------------------------------------------
Context:
The application requires production-grade deployment profiles for development, preview testing, and store releases with strict secret isolation.

Decision:
1. `app.json` configures formal app identity: `name` ("Finance Tracker"), `slug` ("finance-tracker-mobile"), `ios.bundleIdentifier` ("com.financetracker.mobile"), `android.package` ("com.finance.tracker").
2. `eas.json` defines distinct profiles: `development` (dev client), `preview` (internal testing APK/IPA), and `production` (App Store / Google Play).
3. Environment Secret Classification:
   - Public Runtime Config (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`): Client-visible, embedded in bundle.
   - EAS Build Secrets: Environment-level variables injected during build.
   - Signing Credentials (Android Keystore, iOS Certificates): Managed via EAS Credentials.
   - Server-Only Credentials (Supabase Service Role Key): STRICTLY FORBIDDEN from mobile client bundle.

Consequences:
- Audited, repeatable production build pipeline with zero secret leakage.
```

---

## 12. Dependency Rules & Layer Architecture

```text
Layer Dependency Direction:

Presentation Layer
     ↓
Application Layer
     ↓
Domain Layer (Pure TypeScript — 0 External Dependencies)

Infrastructure Layer
     ↓
Application / Domain Ports

Integration Layer
     ↓
Application Event Contracts
```

---

## 13. Architectural Risk Audit

| Risk ID | Risk | Impact | Mitigation | Blocking? |
|---|---|---|---|---|
| **RSK-6.1** | Android 13+ Notification Permission Denial | Notifications fail silently | In-app pre-permission rationale dialog with Settings recovery button | No |
| **RSK-6.2** | Concurrent Sync Mutation Conflict | Data overwrite | Append-only transaction queue + client UUIDs + LWW audit log | No |
| **RSK-6.3** | Crypto Primitive Pipeline Compatibility | Build/Runtime error | Phase 6.6 Crypto Capability Verification Gate | No |

---

## 14. Granular Requirement Traceability Matrix

| Requirement ID | Summary | Domain Contract | Application Use Case | Infrastructure Adapter | Presentation Surface | ADR |
|---|---|---|---|---|---|---|
| `REQ-6.1` | Permission lifecycle | `NotificationSettings` | `RequestNotificationPermissionUseCase` | `ExpoNotificationService` | `NotificationPreferencesSection` | `ADR-022` |
| `REQ-6.2` | Bill reminders | `NotificationIntent` | `ScheduleBillRemindersUseCase` | `ExpoNotificationService` | `NotificationPreferencesSection` | `ADR-022` |
| `REQ-6.3` | Budget alerts (80/100%) | `NotificationIntent` | `HandleBudgetThresholdNotificationUseCase` | `ExpoNotificationService` | `NotificationPreferencesSection` | `ADR-022` |
| `REQ-6.4` | Deep-linking | `NotificationDestination` | `HandleNotificationResponseUseCase` | `ExpoNotificationService` | `/bills`, `/budgets` focus | `ADR-022` |
| `REQ-6.5` | Daily digest & channels | `ReminderTime` | `ScheduleDailyDigestUseCase` | `ExpoNotificationService` | Settings Time Picker | `ADR-022` |
| `REQ-6.6` | NetInfo monitoring | N/A | `ObserveNetworkStatusUseCase` | `NetInfoNetworkStatusProvider` | `SyncStatusSection`, Banner | `ADR-023` |
| `REQ-6.7` | Offline queueing | `SyncQueueItem` | `QueueOfflineMutationUseCase` | SQLite Queue Repos. | `SyncStatusSection` | `ADR-023` |
| `REQ-6.8` | Auto-flush backoff | `SyncQueueItem` | `FlushSyncQueueUseCase` | `SupabaseSyncTransportProvider` | `SyncStatusSection` | `ADR-023` |
| `REQ-6.9` | Conflict rules | `MutationPayload` | `ReconcileSyncConflictUseCase` | SQLite Transaction Runner | Audit Log Badge | `ADR-023` |
| `REQ-6.10` | Offline indicator | N/A | N/A | N/A | `OfflineStatusBanner` | `ADR-023` |
| `REQ-6.11` | Backup container export | `BackupSnapshot` | `ExportEncryptedBackupUseCase` | `AEADCryptoProvider`, `BackupFileProvider` | `BackupRestoreSection` | `ADR-024` |
| `REQ-6.12` | Passphrase AEAD encryption | `BackupManifest` | `ExportEncryptedBackupUseCase` | `AEADCryptoProvider` | `ExportBackupModal` | `ADR-024` |
| `REQ-6.13` | 10-step container validation | `BackupManifest` | `ValidateBackupContainerUseCase` | `AEADCryptoProvider` | `RestorePreviewModal` | `ADR-024` |
| `REQ-6.14` | Preview record audit | `BackupSnapshot` | `PreviewRestoreUseCase` | `AEADCryptoProvider` | `RestorePreviewModal` | `ADR-024` |
| `REQ-6.15` | Zero token leakage | `BackupSnapshot` | `ExportEncryptedBackupUseCase` | `AEADCryptoProvider` | `ExportBackupModal` | `ADR-024` |
| `REQ-6.16` | App identity config | N/A | N/A | `app.json` | Settings App Info Footer | `ADR-025` |
| `REQ-6.17` | Multi-profile EAS | N/A | N/A | `eas.json` | Settings App Info Footer | `ADR-025` |
| `REQ-6.18` | Secret classification | N/A | N/A | `eas.json`, `.env` | N/A | `ADR-025` |
| `REQ-6.19` | Android release signing | N/A | N/A | EAS Credentials | N/A | `ADR-025` |
| `REQ-6.20` | iOS release signing | N/A | N/A | EAS Credentials | N/A | `ADR-025` |

---

## 15. Implementation Boundary (Phase 6.6 Permissions)

### 15.1 Allowed Changes in Phase 6.6 Implementation
- Install `expo-notifications`, `@react-native-community/netinfo`, `expo-file-system`, `expo-document-picker`, `expo-sharing`.
- Perform Crypto Capability Verification Gate for `AEADCryptoProvider`.
- Implement new Phase 6 domain models and use cases in `src/features/preferences/`, `src/features/sync/`, and `src/features/backup/`.
- Implement decoupled adapters (`ExpoNotificationService`, `NetInfoNetworkStatusProvider`, `AEADCryptoProvider`, `BackupFileProvider`, `BackupShareProvider`) in `src/platform/`.
- Implement the 7 new presentation components in `src/features/` and integrate into `app/(tabs)/settings.tsx` and `app/_layout.tsx`.
- Update `app.json` and `eas.json`.

### 15.2 Strictly Frozen Areas (DO NOT CHANGE)
- Phase 5 Analytics & Reporting source code and documents.
- Shared UI primitives in `src/shared/components/` and `src/shared/theme/`.
- Finance Tracker Goals feature (100% deferred).
- Pre-existing database migrations in `supabase/migrations/`.

---

## 16. Approval Gate

```text
==================================================
PHASE 6.5 ARCHITECTURE STATUS: APPROVED & FROZEN 🔒
==================================================
```

*Note: Phase 6.5 Architecture Specification & ADR Review has incorporated all 9 required architectural corrections. No production code has been modified or implemented. Ready to proceed to Phase 6.6 — Implementation Planning.*
