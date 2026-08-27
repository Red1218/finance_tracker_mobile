# Phase 6.4 — Design System, Component Library & Interaction Specification
**Finance Tracker Mobile — Platform & Operations**

## 1. Executive Summary

This document specifies the authoritative **Design System, Component Library, and Interaction Specifications** for **Phase 6 — Platform & Operations**.

Phase 6.4 formalizes the 7 presentation components required for Platform & Operations, their view-model contracts, visual hierarchy, interaction behavior, state models, semantic theme token bindings, accessibility attributes, and composition with pre-existing, frozen Finance Tracker primitives.

**Current Lifecycle Stage**: Phase 6.4 — Design System, Component Library & Interaction Specification  
**Status**: APPROVED & FROZEN 🔒  
**Governance Constraints**:
- **0 production code** implemented.
- **0 Phase 5 frozen code** or shared UI primitives (`src/shared/`) modified.
- **Finance Tracker Goals** feature remains 100% deferred.
- **Semantic theme tokens mandatory** (0 hardcoded wireframe color literals allowed in implementation).
- **Non-blocking banner** uses native pointer-event properties (`pointerEvents="none"`).
- **Restore completion** triggers automatic soft re-render with success feedback.

---

## 2. Design System Governance & Primitive Composition

All Phase 6 presentation components are composed strictly of pre-existing, frozen shared primitives in `src/shared/components/` and token definitions in `src/shared/theme/`:

```text
Phase 6 Presentation Components
├── NotificationPreferencesSection  ──> Composes: Card, Icon, Badge, Button
├── BackupRestoreSection            ──> Composes: Card, Icon, Button
├── SyncStatusSection              ──> Composes: Card, Icon, Badge, Button
├── OfflineStatusBanner             ──> Composes: Icon (Fixed Layout Overlay)
├── ExportBackupModal               ──> Composes: Modal, Input, Button, Icon
├── RestorePreviewModal            ──> Composes: Modal, Button, Icon
└── RestoreBlockingOverlay         ──> Composes: Modal, Icon (Full-screen Alert)
```

No frozen primitives are modified. If an additional primitive capability is required, it is documented as a design system gap for separate resolution without mutating `src/shared/`.

---

## 3. Component Inventory & Architectural Boundaries

### 3.1 Presentation Boundary Rules
Phase 6 presentation components MUST NOT:
- Access Supabase or SQLite directly.
- Execute sync operations or network calls.
- Perform cryptographic encryption/decryption or file serialization.
- Schedule native notifications directly.
- Contain domain business rules.

All state and operations are injected via pure ViewModels and action callbacks.

---

## 4. Detailed Component Specifications

### 4.1 `NotificationPreferencesSection`
- **Purpose**: Render notification toggles, lead-time selector, daily digest time picker, and permission rationale/denied cards in Settings.
- **Responsibility**: Present notification settings state and handle user toggle/selection events.
- **Composition**: `Card` (elevated), `Icon` (`Bell`, `AlertCircle`, `AlertTriangle`), `Badge`, `Button`.
- **Props / Input Contract**:
  ```typescript
  export interface NotificationPreferencesSectionProps {
    viewModel: {
      billRemindersEnabled: boolean;
      billReminderLeadTimeDays: 1 | 3 | 7;
      budgetAlertsEnabled: boolean;
      dailyDigestEnabled: boolean;
      dailyDigestTime: string; // "HH:mm"
      permissionState: 'GRANTED' | 'NOT_REQUESTED' | 'DENIED';
    };
    onToggleBillReminders: (enabled: boolean) => void;
    onChangeLeadTimeDays: (days: 1 | 3 | 7) => void;
    onToggleBudgetAlerts: (enabled: boolean) => void;
    onToggleDailyDigest: (enabled: boolean) => void;
    onChangeDigestTime: (time: string) => void;
    onRequestPermission: () => void;
    onOpenSystemSettings: () => void;
  }
  ```
- **Semantic Tokens Used**: `theme.colors.surface`, `theme.colors.textPrimary`, `theme.colors.textSecondary`, `theme.colors.warningSurface`, `theme.colors.warningText`, `theme.colors.primary`.
- **Accessibility**: `accessibilityRole="switch"`, `accessibilityRole="radiogroup"`, minimum 48×48 dp touch target.

---

### 4.2 `BackupRestoreSection`
- **Purpose**: Provide entry points for encrypted backup export and backup import/restore in Settings.
- **Responsibility**: Surface export and restore triggers with clear security rationale text.
- **Composition**: `Card` (elevated), `Icon` (`Database`, `Shield`), `Button` (`primary` for Export, `secondary` for Restore).
- **Props / Input Contract**:
  ```typescript
  export interface BackupRestoreSectionProps {
    onExportPress: () => void;
    onRestorePress: () => void;
    isExporting?: boolean;
    isRestoring?: boolean;
  }
  ```
- **Semantic Tokens Used**: `theme.colors.surface`, `theme.colors.textPrimary`, `theme.colors.textSecondary`, `theme.colors.primary`.
- **Accessibility**: Buttons labeled `"Export Encrypted Backup"` and `"Restore Data from Backup"`.

---

### 4.3 `SyncStatusSection`
- **Purpose**: Render real-time network connection badge, pending sync queue count, last sync timestamp, and manual sync action.
- **Responsibility**: Surface operational sync state and trigger manual sync requests.
- **Composition**: `Card` (elevated), `Icon` (`Cloud`, `RefreshCw`), `Badge` (`ONLINE` / `OFFLINE` / `SYNC FAILED`), `Button` (`outlined`).
- **Props / Input Contract**:
  ```typescript
  export interface SyncStatusSectionProps {
    viewModel: {
      isOnline: boolean;
      syncStatus: 'IDLE' | 'SYNCING' | 'FAILED';
      pendingMutationCount: number;
      lastSyncTimestamp: Date | null;
      errorMessage: string | null;
    };
    onManualSyncPress: () => void;
  }
  ```
- **Semantic Tokens Used**: `theme.colors.surface`, `theme.colors.success`, `theme.colors.warning`, `theme.colors.error`, `theme.colors.textSecondary`.
- **Accessibility**: Status badge uses `accessibilityLiveRegion="polite"` and explicit text labels (`ONLINE`, `OFFLINE`).

---

### 4.4 `OfflineStatusBanner`
- **Purpose**: Global top toast banner alerting the user when the device transitions to offline mode.
- **Responsibility**: Display visual offline indicator without interrupting active form data entry.
- **Composition**: Container, `Icon` (`WifiOff`), Text label ("Operating Offline — Changes will sync when connected").
- **Layout & Pointer-Event Contract**:
  ```typescript
  export interface OfflineStatusBannerProps {
    isVisible: boolean;
  }
  ```
  - **Native Pointer Events**: Fixed top layout with `pointerEvents="none"` on overlay container to ensure touch inputs pass through cleanly to underlying forms.
- **Semantic Tokens Used**: `theme.colors.warningSurface`, `theme.colors.warningText`, `theme.colors.warningIcon`.
- **Animation**: Slide-down transition (250ms ease-out).
- **Accessibility**: `accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"`.

---

### 4.5 `ExportBackupModal`
- **Purpose**: Passphrase input sheet for creating an encrypted `.ftb` backup container.
- **Responsibility**: Validate passphrase matching and trigger export generation.
- **Composition**: `Modal`, `Input` (passphrase & confirm with eye-icon visibility toggle), `Button` (Primary `Generate`, Flat `Cancel`), `Icon` (`Shield`).
- **Props / Input Contract**:
  ```typescript
  export interface ExportBackupModalProps {
    isVisible: boolean;
    isGenerating: boolean;
    onGenerateExport: (passphrase?: string) => void;
    onCancel: () => void;
  }
  ```
- **Validation**: Shows inline error if passphrase and confirm passphrase inputs do not match.
- **Semantic Tokens Used**: `theme.colors.surfaceModal`, `theme.colors.textPrimary`, `theme.colors.errorText`.

---

### 4.6 `RestorePreviewModal`
- **Purpose**: Audit preview sheet displaying snapshot entity record counts and confirmation of the 1-snapshot safety policy prior to database replacement.
- **Responsibility**: Require explicit user confirmation before executing a destructive restore operation.
- **Composition**: `Modal`, `Icon` (`AlertTriangle`), `Button` (`danger` for Confirm, `secondary` for Cancel).
- **Props / Input Contract**:
  ```typescript
  export interface RestorePreviewModalProps {
    isVisible: boolean;
    metadata: {
      backupDate: Date;
      appVersion: string;
      counts: {
        accounts: number;
        transactions: number;
        budgets: number;
        bills: number;
        categories: number;
      };
    };
    onConfirmRestore: () => void;
    onCancel: () => void;
  }
  ```
- **Policy Messaging**: Displays explicit alert: "Restoring will replace current local data. Exactly ONE latest pre-restore safety snapshot is retained locally."
- **Semantic Tokens Used**: `theme.colors.surfaceModal`, `theme.colors.danger`, `theme.colors.textPrimary`.

---

### 4.7 `RestoreBlockingOverlay`
- **Purpose**: Full-screen non-dismissable overlay blocking user interaction during atomic database restoration.
- **Responsibility**: Prevent app navigation or premature closure while SQLite restore transaction is executing.
- **Composition**: Container, Large Spinner, Step-by-step progress text.
- **Props / Input Contract**:
  ```typescript
  export interface RestoreBlockingOverlayProps {
    isVisible: boolean;
    currentStepMessage: string; // e.g. "Step 2 of 3: Executing SQLite atomic restore..."
  }
  ```
- **Completion Behavior**: Upon completion, triggers automatic soft application state re-render with a success toast notification.
- **Semantic Tokens Used**: `theme.colors.overlayBackground`, `theme.colors.textOnDark`.
- **Accessibility**: `accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"`, `accessibilityViewIsModal={true}`.

---

## 5. Notification Component Patterns

- **Scheduled Local OS Notifications**: Used for Bill Due Reminders and Daily Digest. Registered via native OS alarms.
- **Event-Triggered Local OS Notifications**: Used for Budget 80% and 100% threshold alerts. Triggered immediately by local application event listeners upon expense entry.
- **In-App Banners / Toasts**: Used for real-time feedback (Offline Toast, Sync Toast, Restore Complete Toast) separate from OS notifications.

---

## 6. Backup & Restore Component Patterns

- **Container Format**: Encrypted `.ftb` AEAD file container.
- **Safety Policy Messaging**: Consistently communicates: "Exactly ONE latest pre-restore safety snapshot is retained locally."
- **Export Integrity**: Backup payloads strictly strip JWT session tokens, API keys, and secure store passkeys.

---

## 7. Sync & Offline Component Patterns

- **State Variations**:
  - `ONLINE`: Green `ONLINE` badge, auto-sync active.
  - `OFFLINE`: Amber `OFFLINE` badge, top `OfflineStatusBanner` visible (`pointerEvents="none"`).
  - `SYNCING`: Outlined button showing spinner, badge reads `SYNCING`.
  - `SYNC_FAILED`: Red `SYNC FAILED` badge, retry button enabled.

---

## 8. Interaction Specification

- **Modal Sheet Durations**: Slide-up sheet transition (200ms ease-out), backdrop fade (150ms).
- **Banner Transitions**: Slide-down top banner (250ms ease-out).
- **Notification Destination Pulse**: 1.5-second pulsing highlight border (`theme.colors.accentGlow`) on target card when arriving via notification response handler.
- **Restore Completion**: Automatic soft application re-render + success toast.

---

## 9. State Model Matrix

```text
+------------------------------+---------+---------+---------+---------+----------+----------+
| Surface / Component          | Default | Loading | Success | Error   | Disabled | Offline  |
+------------------------------+---------+---------+---------+---------+----------+----------+
| NotificationPreferencesSec.  | Active  | N/A     | N/A     | Rationale| Denied   | Active   |
| BackupRestoreSection         | Active  | Spinner | N/A     | N/A     | Restoring| Active   |
| SyncStatusSection            | Online  | Spinner | Up-to-dt| Retry   | Offline  | Amber    |
| OfflineStatusBanner          | Hidden  | N/A     | N/A     | N/A     | N/A      | Visible  |
| ExportBackupModal            | Form    | Spinner | Shared  | Mismatch| N/A      | Active   |
| RestorePreviewModal          | Audit   | N/A     | Complete| Corrupt | N/A      | Active   |
| RestoreBlockingOverlay       | Hidden  | Active  | Re-render| Rollback| N/A      | Active   |
+------------------------------+---------+---------+---------+---------+----------+----------+
```

---

## 10. Accessibility Specification

1. **Touch Targets**: Minimum `48 × 48 dp` for all interactive elements.
2. **Live Regions**:
   - `OfflineStatusBanner`: `accessibilityLiveRegion="assertive"`.
   - `SyncStatusSection`: `accessibilityLiveRegion="polite"`.
   - `RestoreBlockingOverlay`: `accessibilityLiveRegion="assertive"`.
3. **Color Independence**: Every operational status pairs visual color indicators with explicit text strings (`ONLINE`, `OFFLINE`, `SYNC FAILED`).

---

## 11. Responsive Specification

- **Mobile Portrait (`< 600dp`)**: Modals display as bottom sheets; Settings sections stack vertically.
- **Tablet / Desktop (`>= 600dp`)**: Modals display as centered dialog cards (`max-width: 520dp`); Settings sections expand into a multi-column card grid.

---

## 12. Semantic Token Requirements

All presentation components consume pre-existing semantic theme tokens from `src/shared/theme/`:

- Surface: `theme.colors.surface`, `theme.colors.surfaceModal`, `theme.colors.overlayBackground`
- Status: `theme.colors.success`, `theme.colors.warning`, `theme.colors.error`, `theme.colors.info`
- Status Surfaces: `theme.colors.warningSurface`, `theme.colors.errorSurface`
- Typography: `theme.colors.textPrimary`, `theme.colors.textSecondary`, `theme.colors.textOnDark`
- Buttons: `theme.colors.primary`, `theme.colors.secondary`, `theme.colors.danger`

**Zero new token gaps identified**. Hardcoding literal hex colors in component code is strictly forbidden.

---

## 13. Component Ownership & Dependency Rules

1. **Presentation Layer Only**: Components reside in `src/features/preferences/presentation/components/`, `src/features/sync/presentation/components/`, and `src/features/backup/presentation/components/`.
2. **ViewModel Decoupling**: Components receive state via props; zero direct coupling to repositories, Supabase clients, or crypto services.

---

## 14. Requirement Traceability Matrix

| Requirement | Target Component | Specification Section |
|---|---|---|
| `REQ-6.1` – `REQ-6.5` | `NotificationPreferencesSection` | Section 4.1 |
| `REQ-6.6` – `REQ-6.10` | `SyncStatusSection`, `OfflineStatusBanner` | Section 4.3, 4.4 |
| `REQ-6.11` – `REQ-6.15` | `BackupRestoreSection`, `ExportBackupModal`, `RestorePreviewModal`, `RestoreBlockingOverlay` | Section 4.2, 4.5, 4.6, 4.7 |
| `REQ-6.16` – `REQ-6.20` | Settings Footer Build Metadata | Section 3 |

---

## 15. Design System Gaps / Dependencies

- **Zero Missing Primitives**: Existing shared primitives (`Card`, `Button`, `Input`, `Modal`, `Icon`, `Badge`) and semantic theme tokens fully satisfy all Phase 6 presentation requirements.

---

## 16. Approval Gate

```text
==================================================
PHASE 6.4 DESIGN SYSTEM & COMPONENT SPECIFICATION: APPROVED & FROZEN 🔒
==================================================
```

*Note: Phase 6.4 Design System, Component Library & Interaction Specification is formally approved and frozen. Ready to proceed to Phase 6.5 — Architecture Specification (Domain, Application, Infrastructure, Presentation, ADRs).*
