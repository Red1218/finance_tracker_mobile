# Phase 6.2 — Wireframe Specifications
**Finance Tracker Mobile — Platform & Operations**

## 1. Executive Summary

This document specifies the authoritative **Wireframe Specifications** for **Phase 6 — Platform & Operations**. 

Phase 6.2 translates the approved Phase 6.1 Information Architecture into detailed UI component layouts, visual hierarchies, interactive state variations (Default, Loading, Success, Error, Offline, Disabled), modal sheets, global overlays, notification destination views, and accessibility flows.

**Current Lifecycle Stage**: Phase 6.2 — Wireframe Specifications  
**Status**: READY FOR REVIEW  
**Governance Constraints**:
- **0 production code** implemented.
- **0 Phase 5 frozen code** or shared UI primitives (`src/shared/`) modified.
- **Finance Tracker Goals** feature remains 100% deferred.

---

## 2. Wireframe Design Principles & Primitive Reuse

1. **Primitive Composition**: All Phase 6 presentation surfaces compose pre-existing, frozen shared primitives (`Card`, `Button`, `Input`, `Modal`, `Icon`, `Badge`) without mutating underlying design tokens.
2. **Visual Hierarchy & Spacing**: Uses standard 8dp grid spacing, 16dp container padding, and typography hierarchy (`heading-lg`, `heading-sm`, `body-md`, `caption`).
3. **Explicit Operational States**: Every visual element clearly surfaces its loading, disabled, error, or offline state with color-independent text indicators.
4. **Accessibility First**: Interactive targets preserve a minimum 48×48 dp touch area; screen reader roles and state announcements are explicitly specified.

---

## 3. Settings Screen Wireframe Overview

Path: `app/(tabs)/settings.tsx`

```text
+-----------------------------------------------------------------------+
|  Settings                                                             |
|  Configure preferences, data backup, and platform synchronization     |
+-----------------------------------------------------------------------+
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [Icon: Bell] NOTIFICATIONS                                       |  |
|  |-----------------------------------------------------------------|  |
|  | Bill Due Reminders                                   ( Switch:ON )|  |
|  |   Lead Time: [ 1 Day ]  [ 3 Days (Selected) ]  [ 7 Days ]       |  |
|  |                                                                 |  |
|  | Budget Threshold Alerts (80% & 100%)              ( Switch:ON )|  |
|  |   Local OS alerts when expense entries cross budget limits      |  |
|  |                                                                 |  |
|  | Daily Financial Digest                            ( Switch:ON )|  |
|  |   Digest Delivery Time: [ 20:00 (TimePicker) ]                  |  |
|  |   Includes: Today's spending summary + Bills due within 48 hours |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [Icon: Database] DATA & BACKUP                                   |  |
|  |-----------------------------------------------------------------|  |
|  | Export Encrypted Backup                                         |  |
|  | Create an encrypted .ftb snapshot file of local data            |  |
|  | [ Button: Export Backup ]                                       |  |
|  |                                                                 |  |
|  | Restore from Backup                                             |  |
|  | Import a .ftb file to restore accounts, transactions & budgets  |  |
|  | [ Button: Restore Data (Secondary) ]                            |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [Icon: Cloud] NETWORK & SYNCHRONIZATION                          |  |
|  |-----------------------------------------------------------------|  |
|  | Connection Status: [ Badge: ONLINE (Green) ]                     |  |
|  | Sync Queue: 0 pending mutations                                 |  |
|  | Last Sync: 2026-08-26 02:10                                     |  |
|  |                                                                 |  |
|  | [ Button: Sync Now (Outlined) ]                                 |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
+-----------------------------------------------------------------------+
```

---

## 4. Notification Settings Wireframes & Permission States

### 4.1 Permission Granted (Default State)
- **Bill Reminders**: Toggle ON, Segmented Lead Time Control enabled (`1 Day`, `3 Days`, `7 Days`).
- **Budget Alerts**: Toggle ON, subtitle: "Local event-triggered OS notifications at 80% and 100% threshold".
- **Daily Digest**: Toggle ON, inline Time Picker (`20:00`), subtitle: "Contains today's spend summary + bills due within 48h".

### 4.2 OS Permission Rationale State (Pre-Permission Rationale)
Appears as an informational card above notification options when OS permission has not yet been requested:

```text
+-----------------------------------------------------------------------+
| [Icon: AlertCircle] Enable Local Notifications                        |
| Receive timely bill due reminders and budget threshold alerts directly|
| on your device. Local notifications do not use remote tracking servers.|
|                                                                       |
| [ Button: Allow Notifications (Primary) ]                             |
+-----------------------------------------------------------------------+
```

### 4.3 Permission Denied State
Appears when the user has explicitly denied OS notification permissions in system settings:

```text
+-----------------------------------------------------------------------+
| [Icon: AlertTriangle] Notifications Blocked in System Settings        |
| Local alerts are currently disabled by your device operating system.  |
| To enable bill reminders, please allow notifications for Finance      |
| Tracker in OS Settings.                                               |
|                                                                       |
| [ Button: Open OS Settings (Secondary) ]                              |
+-----------------------------------------------------------------------+
```

---

## 5. Export Backup Sheet Wireframe

Triggers when user taps `Export Backup` button in Settings.

```text
+-----------------------------------------------------------------------+
| [Modal Sheet] Export Encrypted Backup                               |
| Create a passphrase-protected .ftb backup file.                        |
+-----------------------------------------------------------------------+
|                                                                       |
| Passphrase (Optional):                                                |
| [ Input: ••••••••••••••• (Eye Icon) ]                                 |
|                                                                       |
| Confirm Passphrase:                                                   |
| [ Input: ••••••••••••••• (Eye Icon) ]                                 |
|                                                                       |
| [Icon: Shield] Security Rationale:                                    |
| Your backup contains transactions, accounts, and budgets. Setting a   |
| passphrase encrypts the container using AEAD protection.              |
|                                                                       |
| [ Button: Generate & Share Backup (.ftb) (Primary) ]                  |
| [ Button: Cancel (Flat) ]                                             |
+-----------------------------------------------------------------------+

-- State Variations --
1. Processing State: Button replaces text with Spinner ("Packaging .ftb backup..."). Inputs disabled.
2. Success Handoff: Triggers native OS Share Sheet (Save to Files / Drive / Share).
3. Passphrase Mismatch Error: Red error text under Confirm input ("Passphrases do not match.").
```

---

## 6. Restore Flow & Preview Modal Wireframes

### 6.1 Passphrase Prompt Modal (If `.ftb` File is Encrypted)

```text
+-----------------------------------------------------------------------+
| [Modal] Enter Passphrase to Decrypt Backup                            |
+-----------------------------------------------------------------------+
| File: finance_tracker_backup_20260826.ftb                             |
|                                                                       |
| Enter Passphrase:                                                     |
| [ Input: ••••••••••••••• ]                                            |
|                                                                       |
| [ Error: Incorrect passphrase. Decryption failed. (Red text) ]        |
|                                                                       |
| [ Button: Decrypt & Preview (Primary) ]   [ Button: Cancel (Flat) ]   |
+-----------------------------------------------------------------------+
```

### 6.2 Restore Preview & Confirmation Modal

```text
+-----------------------------------------------------------------------+
| [Modal] Restore Backup Preview & Confirmation                         |
+-----------------------------------------------------------------------+
| Backup Date: 2026-08-26 01:45 | App Version: 1.0.0                    |
| Container Format: FTB AEAD Encrypted                                  |
|                                                                       |
| Snapshot Contents Audit:                                              |
| • Accounts: 4 items                                                   |
| • Transactions: 1,248 items                                           |
| • Budgets: 6 items                                                    |
| • Bills: 8 items                                                      |
| • Categories: 14 items                                                |
|                                                                       |
| +-------------------------------------------------------------------+ |
| | [Icon: AlertTriangle] WARNING: DESTRUCTIVE ACTION                 | |
| | Restoring will replace your current local database with this     | |
| | backup. Exactly ONE safety snapshot of your current database will| |
| | be retained locally for recovery if needed.                       | |
| +-------------------------------------------------------------------+ |
|                                                                       |
| [ Button: Confirm & Overwrite Local Data (Danger - Red) ]             |
| [ Button: Cancel (Secondary) ]                                        |
+-----------------------------------------------------------------------+
```

### 6.3 Restore Error States
- **Corrupted Container**: Modal shows Red Warning Icon + Copy: "Backup container is corrupted or has failed AEAD tag verification. Restore aborted."
- **Incompatible Version**: Modal shows Amber Icon + Copy: "This backup was generated by a newer version of Finance Tracker. Please update your app."

---

## 7. Restore Blocking Overlay Wireframe

Appears globally over the entire screen during active SQLite database restoration to prevent user interaction or app navigation:

```text
+-----------------------------------------------------------------------+
|                                                                       |
|                       [ Large Loading Spinner ]                       |
|                                                                       |
|                     Restoring Local Database...                       |
|       Applying backup snapshot and updating internal database.        |
|                 Please do not close the application.                  |
|                                                                       |
|         Step 1 of 3: Creating safety snapshot... [Done]               |
|         Step 2 of 3: Executing SQLite atomic restore... [Active]      |
|         Step 3 of 3: Rebuilding search indices... [Pending]           |
|                                                                       |
+-----------------------------------------------------------------------+
```

---

## 8. Network & Synchronization Wireframe Variations

### 8.1 Network & Sync Card States (Inside Settings)

```text
-- State A: ONLINE (Idle / Up to Date) --
Connection Status: [ Badge: ONLINE (Green) ]
Sync Queue: 0 pending mutations
Last Sync: Just now
[ Button: Sync Now ]

-- State B: OFFLINE --
Connection Status: [ Badge: OFFLINE (Amber) ]
Sync Queue: 3 pending mutations saved locally
Last Sync: 2026-08-25 18:30
[ Button: Sync Now (Disabled) ]

-- State C: SYNCING --
Connection Status: [ Badge: ONLINE (Green) ]
Sync Queue: Syncing 3 mutations... [ Spinner ]
[ Button: Syncing... (Disabled with Spinner) ]

-- State D: SYNC FAILED --
Connection Status: [ Badge: ONLINE (Green) ]
Sync Queue: 3 pending mutations [ Retry Badge ]
Last Sync: Failed (Server unreachable)
[ Error Text: "Sync failed — Will retry automatically on next network change" ]
[ Button: Retry Sync Now (Primary) ]
```

---

## 9. Global Offline Status Banner Wireframe

Appears at the very top of the screen (under status bar) when device transitions to offline mode. Non-blocking to allow active user data entry.

```text
+-----------------------------------------------------------------------+
| [Icon: WifiOff] Operating Offline — Changes will sync when connected  |
+-----------------------------------------------------------------------+

-- Animation & Layout Spec --
- Position: Fixed Top, zIndex: 999.
- Entry: Slide-down transition (250ms ease-out).
- Colors: Background `#FEF3C7` (Amber 100), Text `#92400E` (Amber 800), Icon `#D97706` (Amber 600).
- Interaction: Non-blocking (touch events pass through to underlying form inputs).
```

---

## 10. Notification Destination Views & Focus Wireframes

When a user opens the app by tapping an OS notification, the app navigates via `NotificationDestination` enums:

### 10.1 Target Focus: Bill Due Reminder (`NotificationDestination.BILLS`)
- Navigates to `/bills`.
- Automatically scrolls to the targeted bill card.
- Applies a 1.5-second pulsing highlight border (`#3B82F6` blue glow) around the specific bill item card.

### 10.2 Target Focus: Budget Alert 80%/100% (`NotificationDestination.BUDGETS`)
- Navigates to `/budgets`.
- Displays top toast banner: "Budget Warning: [Category Name] is at [80%/100%] of limit".
- Scrolls directly to the corresponding budget card with progress bar highlighted in Amber (80%) or Red (100%).

### 10.3 Target Focus: Daily Digest (`NotificationDestination.DASHBOARD`)
- Navigates to main Dashboard (`/(tabs)`).
- Opens an inline Daily Summary Card highlighting: "Today's Spent: ₹X,XXX.XX | Upcoming Bills: Y due in 48h".

---

## 11. Component Inventory

| Component Name | Description | Composed Frozen Primitives |
|---|---|---|
| **`NotificationPreferencesSection`** | Container for bill, budget & daily digest notification settings | `Card`, `Icon`, `Badge`, `Button` |
| **`BackupRestoreSection`** | Container for export & restore database actions | `Card`, `Icon`, `Button` |
| **`SyncStatusSection`** | Container for live connection status & manual sync control | `Card`, `Icon`, `Badge`, `Button` |
| **`ExportBackupModal`** | Passphrase sheet & share trigger | `Modal`, `Input`, `Button`, `Icon` |
| **`RestorePreviewModal`** | Record count audit & destructive confirm modal | `Modal`, `Button`, `Icon` |
| **`RestoreBlockingOverlay`** | Full-screen atomic restore progress overlay | `Modal`, `Icon` |
| **`OfflineStatusBanner`** | Non-blocking global top offline banner | `Icon` |

---

## 12. State Matrix

```text
+------------------------------+---------+---------+---------+---------+----------+----------+
| Surface / Component          | Default | Loading | Success | Error   | Disabled | Offline  |
+------------------------------+---------+---------+---------+---------+----------+----------+
| Notification Preferences     | Active  | N/A     | N/A     | Rationale| Denied   | Active   |
| Backup Export Modal          | Form    | Spinner | Shared  | Mismatch| N/A      | Active   |
| Restore Preview Modal        | Audit   | N/A     | Complete| Corrupt | N/A      | Active   |
| Sync Status Section          | Online  | Spinner | Up-to-dt| Retry   | Disabled | Amber    |
| Offline Status Banner        | Hidden  | N/A     | N/A     | N/A     | N/A      | Visible  |
+------------------------------+---------+---------+---------+---------+----------+----------+
```

---

## 13. Accessibility Specification

1. **Touch Target Dimensions**: All switches, lead time segmented buttons, time pickers, export/restore buttons, and modal actions preserve a minimum target size of `48 × 48 dp`.
2. **Screen Reader Roles & Labels**:
   - `Bill Reminders Switch`: `accessibilityRole="switch"`, `accessibilityLabel="Enable bill due reminders"`, `accessibilityState={{ checked: true }}`.
   - `Lead Time Selector`: `accessibilityRole="radiogroup"`, options labelled `"1 day before"`, `"3 days before"`, `"7 days before"`.
   - `Sync Status Badge`: `accessibilityLabel="Connection status: Online"`, `accessibilityLiveRegion="polite"`.
   - `Restore Blocking Overlay`: `accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"`, `accessibilityViewIsModal={true}`.
3. **Color Independence**: Badges and status banners always pair color indicators with explicit text strings (`ONLINE`, `OFFLINE`, `SYNC FAILED`).

---

## 14. Responsive & Layout Rules

- **Mobile Portrait (< 600dp width)**: Modals display as bottom sheets; Settings sections stack vertically in single column.
- **Mobile Landscape / Tablet (>= 600dp width)**: Modals display as centered dialog cards (max-width `520dp`); Settings sections expand to multi-column card grid.

---

## 15. Requirement Traceability Matrix

| Requirement ID | Mapped Wireframe Section | Mapped Presentation Component |
|---|---|---|
| `REQ-6.1` – `REQ-6.5` | Section 4 (Notification Wireframes) | `NotificationPreferencesSection`, Rationale Card |
| `REQ-6.6` – `REQ-6.10` | Section 8 & 9 (Sync & Banner Wireframes) | `SyncStatusSection`, `OfflineStatusBanner` |
| `REQ-6.11` – `REQ-6.15` | Section 5, 6 & 7 (Export/Restore Wireframes) | `BackupRestoreSection`, `ExportBackupModal`, `RestorePreviewModal`, `RestoreBlockingOverlay` |
| `REQ-6.16` – `REQ-6.20` | Section 3 (Settings Info Footer) | Build Profile & Environment Badge |

---

## 16. Open Design Questions

1. **Restore Complete Behavior**: Should restoring database trigger an automatic application soft-reload via Expo Router, or present an explicit "Reload App" completion button? (Recommended: Soft app re-render with success toast).

---

## 17. Approval Gate

```text
==================================================
PHASE 6.2 WIREFRAME STATUS: READY FOR REVIEW
==================================================
```

*Note: No production code has been modified or implemented. Awaiting explicit user review and approval before proceeding to Phase 6 Design Review Gate.*
