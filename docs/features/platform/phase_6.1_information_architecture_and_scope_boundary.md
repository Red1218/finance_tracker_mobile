# Phase 6.1 — Information Architecture & Scope Boundary Specification
**Finance Tracker Mobile — Platform & Operations**

## 1. Executive Summary

This document specifies the authoritative **Information Architecture (IA) and Scope Boundary** for **Phase 6 — Platform & Operations**. 

Phase 6.1 translates the approved Phase 6 requirements (`REQ-6.1` through `REQ-6.20`) into structured user journeys, screen hierarchies, navigation contracts, global platform presentation states, and explicit architectural responsibility boundaries across Presentation, Application, Domain, and Infrastructure layers.

**Current Lifecycle Stage**: Phase 6.1 — Information Architecture & Scope Boundary  
**Status**: APPROVED & FROZEN 🔒  
**Governance Constraints**:
- **0 production code** implemented.
- **0 Phase 5 frozen code** or shared UI primitives (`src/shared/`) modified.
- **Finance Tracker Goals** feature remains 100% deferred.

---

## 2. Information Architecture Principles

1. **Progressive Disclosure**: Settings controls and operational statuses are grouped logically into dedicated sections to prevent cognitive overload.
2. **Local-First & Privacy-Centric**: User data ownership is surfaced through explicit backup export/import controls with clear safety confirmations.
3. **Non-Intrusive Offline Awareness**: Network state and sync operations are indicated subtly without blocking local user data entry unless a destructive or global restore operation is active.
4. **Platform & Device Agnostic**: Navigation contracts and state presentations remain decoupled from native OS implementations, delegating platform specifics strictly to infrastructure services.

---

## 3. Settings Information Architecture

The Settings tab (`app/(tabs)/settings.tsx`) serves as the primary configuration hub for Phase 6 features.

```text
Settings Screen Hierarchy
├── Header (Page Title & Subtitle)
│
├── Section 1: Notifications
│   ├── Item 1.1: Bill Due Reminders [Toggle Switch]
│   │   └── Sub-item: Notification Lead Time Selector (1 Day, 3 Days, 7 Days)
│   ├── Item 1.2: Budget Threshold Alerts [Toggle Switch] (Local Event-Triggered OS Notifications: 80% & 100%)
│   ├── Item 1.3: Daily Financial Digest [Toggle Switch]
│   │   └── Sub-item: Digest Time Picker (HH:mm) [Content: Today's spend + Bills due within 48h]
│   └── Item 1.4: OS Permission Rationale Banner (Visible only if OS permission is denied)
│
├── Section 2: Data & Backup
│   ├── Item 2.1: Export Encrypted Backup [Button] -> Opens Encrypted Export Sheet (.ftb)
│   └── Item 2.2: Restore from Backup [Button] -> Opens File Picker -> Restore Preview Modal
│
├── Section 3: Network & Synchronization
│   ├── Item 3.1: Network Connection Status Badge [Indicator: Online (Green) / Offline (Amber)]
│   ├── Item 3.2: Pending Sync Queue Count [Text: "X pending mutations"]
│   ├── Item 3.3: Last Successful Sync Timestamp [Text: "Last synced: HH:mm"]
│   └── Item 3.4: Manual Sync Now [Button with Spinner during active sync]
│
└── Section 4: Application Info (Pre-existing)
    └── Version, Build Profile (Dev/Preview/Prod), Terms & Privacy links
```

---

## 4. Global Application Information Architecture

Global UI elements reside in or are hosted by the Root Layout (`app/_layout.tsx`) to maintain cross-screen accessibility:

```text
Root Layout (app/_layout.tsx)
├── Screen Stack (Navigation Container)
│
├── Global UI Infrastructure:
│   ├── Offline Connection Banner (Top Toast / Bar when device loses connectivity)
│   ├── Active Restore Blocking Overlay (Full-screen modal during atomic SQLite database restore)
│   └── Global Toast Container (Success/Error feedback for Backup Export & Sync completion)
│
└── Event Handlers:
    ├── Global Notification Response Listener (Decoupled destination dispatcher)
    └── Real-time Network Listener (@react-native-community/netinfo subscriber)
```

---

## 5. Notification Navigation Architecture

When a user taps an OS notification, the Notification Response Handler extracts the payload contract and dispatches navigation via application destination enums without coupling application code to Expo Router path strings.

### 5.1 Application Destination Contract (Decoupled)
```typescript
export enum NotificationDestination {
  BILLS = 'BILLS',
  BUDGETS = 'BUDGETS',
  DASHBOARD = 'DASHBOARD',
}

export interface NotificationPayloadContract {
  notificationId: string;
  category: 'BILL_DUE_REMINDER' | 'BUDGET_THRESHOLD_ALERT' | 'DAILY_DIGEST';
  destination: NotificationDestination;
  params: {
    entityId?: string; // e.g. billId or budgetId
    thresholdPercent?: number; // 80 or 100
  };
}
```

### 5.2 Navigation Destination Mapping (Presentation Layer Mapping)

| Notification Trigger | Application Destination | Presentation Route Target | Target Focus |
|---|---|---|---|
| **Bill Due Reminder** | `NotificationDestination.BILLS` | `/bills` | Navigates to Bills tab and scrolls/highlights the target bill card. |
| **Budget 80% Alert** | `NotificationDestination.BUDGETS` | `/budgets` | Navigates to Budgets tab with warning toast highlighted. |
| **Budget 100% Alert** | `NotificationDestination.BUDGETS` | `/budgets` | Navigates to Budgets tab focused on exceeded budget card. |
| **Daily Financial Digest** | `NotificationDestination.DASHBOARD` | `/(tabs)` (Dashboard) | Opens main Dashboard to view daily spending & cash flow summary. |

---

## 6. Offline & Synchronization UX Architecture

### 6.1 Surface Presentation of Network States

```text
[State: ONLINE]
└─ Settings Screen: Green "Online" badge
└─ Sync behavior: Auto-flush sync queue in background

[State: OFFLINE]
└─ Root Layout: Subtle amber top banner ("Operating Offline — Changes saved locally")
└─ Settings Screen: Amber "Offline" badge with pending mutation queue count
└─ Entry Forms: Expense/Transaction entry remains 100% active (Append-only queue)

[State: SYNCING]
└─ Settings Screen: Manual Sync button shows active loading spinner
└─ Sync Banner: Small sliding spinner badge ("Syncing X changes...")

[State: SYNC_FAILED]
└─ Settings Screen: Red alert badge ("Sync failed — Retrying automatically")
└─ Sync Banner: Red retry bar ("Server unreachable — Queue preserved locally")
```

---

## 7. Backup & Restore UX Architecture

### 7.1 Export Backup Journey
```text
[Settings Screen]
  └─ Tap "Export Encrypted Backup"
      └─ [Modal: Export Backup Sheet]
          ├─ Enter Optional Passphrase (Input field)
          ├─ Confirm Passphrase (Input field)
          ├─ Tap "Generate & Export Backup"
          └─ Processing Spinner -> Triggers Native Share Sheet (.ftb container)
              └─ User selects file destination (Files app, Drive, AirDrop, Save to Device)
                  └─ Success Toast: "Backup exported successfully"
```

### 7.2 Restore Backup Journey & Safety Snapshot Policy
```text
[Settings Screen]
  └─ Tap "Restore from Backup"
      └─ [Native Document Picker] (User selects .ftb file)
          └─ If encrypted: [Modal: Enter Passphrase Prompt]
              └─ Validation & Decryption
                  └─ [Modal: Restore Preview & Safety Audit]
                      ├─ Displays: Accounts count, Transactions count, Budgets count, Bills count
                      ├─ Displays: Backup Creation Date & Version compatibility
                      ├─ Warning Alert: "Restoring will replace current local database. Exactly ONE latest safety snapshot is retained locally."
                      ├─ Action: [Cancel] vs [Confirm & Replace Database]
                          └─ [Blocking Overlay: Restoring Database...]
                              ├─ Overwrites local safety snapshot with pre-restore database state
                              ├─ Executes atomic SQLite restore transaction
                              └─ Completion -> App Reload / Refresh -> Success Toast
```

### 7.3 Failure & Edge Case Journeys

| Edge Case | User-Visible Feedback | Recovery Path |
|---|---|---|
| **Incorrect Passphrase** | Red inline error: "Incorrect passphrase. Decryption failed." | Re-enter passphrase or cancel. |
| **Corrupted File / Invalid AEAD Tag** | Modal Error: "Backup container is corrupted or has been tampered with." | Select a different valid `.ftb` file. |
| **Incompatible Schema Version** | Modal Error: "Backup was created with an incompatible app version." | Update app or select compatible backup. |
| **Restore Transaction Interrupted** | Automatic safety snapshot rollback on app startup. | Database restored to pre-attempt state cleanly. |

---

## 8. Scope Boundary Matrix

The following matrix delineates exact responsibility boundaries across layers:

| Feature / Responsibility | Presentation Layer | Application Layer | Domain Layer | Infrastructure Layer |
|---|---|---|---|---|
| **Notification Scheduling** | Toggles & Time Picker in Settings | `ScheduleDailyReminderUseCase` | `NotificationSettings` VO | `ExpoNotificationService` |
| **Notification Rationale Dialog** | In-app pre-permission explanation modal | `RequestNotificationPermissionUseCase` | N/A | `Notifications.requestPermissionsAsync` |
| **Budget Threshold Detection** | Budget progress bar styling | `ValidateBudgetThresholdUseCase` | `Budget` aggregate threshold logic | Event listener in `TransactionModule` |
| **Network Status Detection** | Connection badge & top banner | `INetworkStatusProvider` port | N/A | `@react-native-community/netinfo` adapter |
| **Sync Queue Orchestration** | Pending queue count badge | `FlushSyncQueueUseCase` | `SyncQueueItem` entity | `SupabaseSyncTransportProvider` |
| **Conflict Resolution** | Offline status badge | `ReconcileSyncConflictUseCase` | Merge rules & timestamp checks | SQLite transaction runner |
| **Backup Encryption/Packaging** | Export modal passphrase form | `ExportEncryptedBackupUseCase` | Backup snapshot Data Transfer Object | AEAD crypto container builder & FileSystem |
| **Backup Schema Validation** | Restore preview modal UI | `ValidateBackupSchemaUseCase` | Backup schema version validator | JSON parser & AEAD tag checker |
| **Restore Database Transaction** | Blocking restore overlay | `ExecuteRestoreUseCase` | N/A | SQLite database transaction manager |
| **EAS & Build Configuration** | N/A | N/A | N/A | `app.json`, `eas.json`, build scripts |

---

## 9. Route Impact Analysis

| Route File | Current Purpose | Phase 6.1 IA Changes Required |
|---|---|---|
| `app/(tabs)/settings.tsx` | App & user preferences | Add Notification, Data & Backup, and Sync Status sections. |
| `app/_layout.tsx` | Root layout & navigation container | Add global notification listener host, network status banner, restore overlay. |
| `app/(tabs)/bills.tsx` | Bills listing & management | Add deep-link focus handler for `entityId` highlight. |
| `app/(tabs)/budgets.tsx` | Budgets listing & management | Add deep-link focus handler for `entityId` highlight. |
| `app/(tabs)/index.tsx` | Main Dashboard | Add deep-link focus handler for daily digest entry. |

---

## 10. Shared Component Reuse Analysis

Existing shared UI primitives in `src/shared/components/` and `src/shared/theme/` **remain 100% frozen and untouched**. 

Phase 6 presentation components will compose the following pre-existing primitives:

- **`Card`** (`elevated`, `outlined` variants): Used for Settings section containers.
- **`Button`** (`primary`, `secondary`, `danger` variants): Used for Export, Restore, and Manual Sync actions.
- **`Input`**: Used for passphrase entry in export/import modals.
- **`Modal`**: Used for Export Backup Sheet and Restore Preview Modal.
- **`Icon`**: Reuses existing icons (`Bell`, `Shield`, `Cloud`, `Database`, `RefreshCw`, `AlertTriangle`).
- **`Badge`**: Used for Online/Offline status indicators.

---

## 11. New Component Candidates (For Phase 6.2 Wireframing)

The following new presentation components will be designed in Phase 6.2 and built in Phase 6.4:

1. **`NotificationPreferencesSection`**: Presentation container for bill, budget, and daily digest notification settings.
2. **`BackupRestoreSection`**: Presentation container for export and restore actions.
3. **`SyncStatusSection`**: Presentation container for real-time network connection badge and manual sync trigger.
4. **`OfflineStatusBanner`**: Global top bar banner indicating offline operation mode.
5. **`ExportBackupModal`**: Passphrase entry and native share trigger sheet.
6. **`RestorePreviewModal`**: Pre-restore entity audit preview and explicit confirmation sheet.
7. **`RestoreBlockingOverlay`**: Full-screen modal blocking user input during atomic database restoration.

---

## 12. State & Error Architecture

### 12.1 Operational States Matrix

```text
+-------------------+--------------------+--------------------+--------------------+
| State             | Loading            | Success            | Error / Failure    |
+-------------------+--------------------+--------------------+--------------------+
| Notifications     | Permission checking| Notification set   | Permission denied  |
| Sync Engine       | Syncing spinner    | Sync complete      | Connection timeout |
| Backup Export     | Generating container| File shared       | Encryption failed  |
| Restore Import    | Decrypting & valid | Database reloaded  | Corrupted file     |
+-------------------+--------------------+--------------------+--------------------+
```

---

## 13. Accessibility Considerations

1. **Screen Reader Announcements**: Network state changes (Online ↔ Offline) and backup completion must trigger `AccessibilityInfo.announceForAccessibility`.
2. **Touch Targets**: Toggle switches, time pickers, and backup action buttons must maintain minimum 48×48 dp touch target dimensions.
3. **Color Contrast & Indicators**: Online (Green) and Offline (Amber) badges must include explicit text labels ("Online", "Offline") in addition to color indicators to support color-blind users.

---

## 14. Non-Goals Confirmation

Phase 6.1 Information Architecture explicitly **EXCLUDES**:
- Remote push notification server infrastructure (FCM/APNs servers).
- Automatic cloud backup to third-party services.
- Resuming the deferred Finance Tracker Goals feature.
- New financial domain entities or changes to Phase 5 Analytics & Reporting.
- Any modification to frozen `src/shared/` primitives.

---

## 15. Requirement Traceability Matrix

| Requirement ID | Requirement Summary | Target IA Section / Component |
|---|---|---|
| `REQ-6.1` – `REQ-6.5` | Notifications & Reminders | Section 3 (Settings Notifications), Section 5 (Notification Navigation) |
| `REQ-6.6` – `REQ-6.10` | Offline Resilience & Sync | Section 3 (Settings Sync), Section 4 (Global UI), Section 6 (Offline UX) |
| `REQ-6.11` – `REQ-6.15` | Backup & Restore | Section 3 (Settings Data), Section 7 (Backup/Restore Journey) |
| `REQ-6.16` – `REQ-6.20` | EAS & Deployment | Section 8 (Scope Boundary Matrix - Infrastructure Layer) |

---

## 16. Approved Product & Architectural Decisions

1. **Daily Digest Content**: Contains a combined summary of **Today's total spending + Bills due within the next 48 hours**.
2. **Pre-restore Safety Backup Policy**: Retains **exactly one latest pre-restore safety snapshot** locally, replacing the previous snapshot on subsequent restores.
3. **Notification Terminology**: Budget alerts are **local event-triggered OS notifications**; banners/toasts are separate in-app presentation mechanisms.
4. **Route Decoupling**: Payloads use `NotificationDestination` enums (`BILLS`, `BUDGETS`, `DASHBOARD`), mapping to Expo Router paths strictly in Presentation/Integration layers.

---

## 17. Approval Gate

```text
==================================================
PHASE 6.1 IA STATUS: APPROVED & FROZEN 🔒
==================================================
```

*Note: Phase 6.1 Information Architecture & Scope Boundary is fully approved and frozen. Ready to proceed to Phase 6.2 (Wireframe Specifications).*
