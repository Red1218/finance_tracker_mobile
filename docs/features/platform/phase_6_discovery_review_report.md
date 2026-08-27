# Phase 6 Discovery Review Report
**Finance Tracker Mobile — Platform & Operations**

## 1. Executive Decision

**Status**: **CONDITIONALLY APPROVED — NOT FROZEN** ⚠️

The Phase 6 Investigation and Product Requirements document provides a comprehensive audit of existing capabilities and repository configuration. However, four critical areas require architectural refinement, scope clarification, and lifecycle alignment before Phase 6 Discovery can be marked **APPROVED & FROZEN 🔒**.

**Key Directives**:
- **0 production code** shall be implemented during this review stage.
- **0 Phase 5 frozen code** or shared UI primitives shall be altered.
- **Goals feature remains 100% deferred** and untouched.

---

## 2. Requirements Review

Each requirement (`REQ-6.1` through `REQ-6.20`) was evaluated for correctness, testability, architectural ownership, and feasibility:

| Requirement Range | Area | Evaluation & Classification | Required Action |
|---|---|---|---|
| `REQ-6.1` – `REQ-6.5` | Notifications | **REQUIRED (Classification Change)**: Terminology must be updated from "Push & Local Notifications" to "Local Notifications & Notification Infrastructure". Remote push servers (FCM/APNs) are out of scope. | Update requirement wording to specify OS-level scheduled local triggers and in-app event triggers. |
| `REQ-6.6` – `REQ-6.10` | Offline / Sync | **REQUIRED (Refinement Needed)**: "100% offline read/write capability" is overly broad and creates silent data loss risk under naive server-wins strategies. | Scope offline mutation support specifically to entity types with deterministic conflict models (Transactions, Bills). |
| `REQ-6.11` – `REQ-6.15` | Backup & Restore | **REQUIRED (Abstraction Fix)**: Prescribing PBKDF2 100,000 iterations and raw 50% zip compression in discovery is prematurely implementation-specific. | Re-spec security requirements at the architecture level (AEAD container, passphrase-derived encryption, zero-token payload). |
| `REQ-6.16` – `REQ-6.20` | EAS / Deployment | **NO CHANGE**: App metadata standardization, multi-profile `eas.json`, and secret injection principles are sound and correctly bounded. | Retain as written. |

---

## 3. Architecture Review

- **Clean Architecture Boundaries**: The proposed platform additions respect existing domain ports (`INotificationService`, `INetworkStatusProvider`) and platform isolation in `src/platform/`.
- **ADR-011 Route Boundary**: Settings UI additions and notification deep-linking must strictly adhere to root route rules in `app/`. No logic or services shall be created in `app/`.
- **ADR-019 & ADR-021 Integrity**: Reporting read models and AI Insights ownership remain 100% read-only and preserved.

---

## 4. Notification Review

### 4.1 Terminology & Scope Correction [REQUIRED]
- **Finding**: The discovery document referred to "Push & Local Notifications", but explicitly excluded remote push notification servers.
- **Resolution**: Phase 6 shall be formally designated **Local Notifications & Notification Infrastructure**.
- **Delivery Mechanisms**:
  1. **Bill Reminders**: Scheduled local OS notifications registered via `expo-notifications` based on bill due dates and lead-time preferences.
  2. **Budget Threshold Alerts**: Event-driven local notifications triggered immediately when an expense entry pushes a budget past 80% or 100% threshold.
  3. **Daily Reminders**: Local OS daily alarm trigger set to user-configured time.
  4. **Deep-linking**: OS notification response handler in `app/_layout.tsx` targeting route paths (`/bills`, `/budgets`).

---

## 5. Offline/Sync Review

### 5.1 Conflict Resolution & Data Safety Risk [REQUIRED]
- **Finding**: Naive "server-wins" conflict resolution for offline edits can silently overwrite user transactions recorded locally while offline.
- **Resolution**:
  - **Transaction Creation**: Pure append-only local mutation queue with client-generated UUIDs. Guarantee zero data loss during sync.
  - **Transaction Edits / Deletions**: Require timestamp-based last-write-wins or explicit user prompt when concurrent remote modification is detected.
  - **Bills & Budgets**: Server-reconciled with entity-specific merge rules defined in `ADR-023`.
  - **Retry & Backoff**: Exponential backoff with random jitter to prevent server thundering herd on network restoration.

---

## 6. Backup/Restore Security Review

### 6.1 Cryptographic Container & Architectural Abstraction [REQUIRED]
- **Finding**: Discovery prescribed specific byte-level implementation details (100k PBKDF2 iterations, 50% zip compression) while missing authenticated encryption envelope requirements.
- **Resolution**:
  - Discovery document shall specify **Authenticated Encryption with Associated Data (AEAD)** container format (`.ftb` container wrapping encrypted data payload, salt, IV, and auth tag).
  - AES-GCM mode inherently ensures integrity authentication; external checksums are secondary to AEAD tag verification.
  - Detailed key derivation parameters (PBKDF2 iteration count, salt length) shall be formally evaluated and frozen in `ADR-024`.
  - Backup exports MUST strictly exclude session JWTs, auth refresh tokens, and encryption keys.

---

## 7. EAS / Deployment Review

### 7.1 Release Pipeline Bounding [RECOMMENDED]
- **Environment Profiles**: `eas.json` will define `development` (internal dev client), `preview` (staging/QA APK/IPA), and `production` (App Store / Google Play).
- **Secrets Management**: Sensitive keys (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) injected via environment variables; release signing keys managed securely via EAS Credentials.

---

## 8. Information Architecture Review

- **Affected Presentation Routes**:
  - `app/(tabs)/settings.tsx`: Add Notification Preferences, Backup & Restore controls, and Real-time Sync Status indicator.
  - `app/_layout.tsx`: Add global notification deep-link listener.
- **Shared Primitives**: Retain all existing UI primitives (`Card`, `Button`, `Input`, `Modal`, `Icon`) without mutation.

---

## 9. ADR Review & Phase Sequencing

### 9.1 Phase Lifecycle Sequence Correction [REQUIRED]
- **Finding**: Discovery document incorrectly stated proceeding immediately to Phase 6.1 (Design System) and Phase 6.2 (Architecture Review & ADRs).
- **Corrected Lifecycle Sequence**:
  ```
  Stage 1: Investigation / Product Requirements (Current — Conditionally Approved)
  Stage 2: Information Architecture & Scope Boundary (Next)
  Stage 3: Wireframe Specifications
  Stage 4: Design Review
  Stage 5: Design System Specification
  Stage 6: Component Library & Interaction Design
  Stage 7: Architecture Review & ADRs (ADR-022 through ADR-025)
  Stage 8: Implementation Planning
  Stage 9: Feature Implementation
  Stage 10: Verification & Documentation Update
  ```

---

## 10. Required Changes Manifest

The following modifications must be applied to `docs/features/platform/phase_6_investigation_and_product_requirements.md` before freezing:

1. **[REQUIRED] Update Notification Scope**: Rename section to "Local Notifications & Notification Infrastructure" and clarify OS local scheduling vs event-driven triggers.
2. **[REQUIRED] Refine Offline Sync & Conflict Rules**: Update `REQ-6.7` – `REQ-6.9` to specify transaction creation append queues and entity-specific merge rules instead of blanket server-wins.
3. **[REQUIRED] Abstract Backup Cryptography**: Shift PBKDF2 iteration details to `ADR-024` candidate and specify AEAD container requirements.
4. **[REQUIRED] Align Lifecycle Sequence**: Correct next phase lifecycle steps to IA/Scope Boundary → Wireframes → Design Review → Design System → Architecture.

---

## 11. Optional Improvements

- **[RECOMMENDED] Notification Rationale Modal**: Present an in-app explanation sheet before requesting OS system notification permissions to maximize user opt-in rate.
- **[OPTIONAL] Export Pre-flight Health Check**: Validate SQLite database consistency before generating backup export payloads.

---

## 12. Open Product Decisions

1. **Notification Lead Days**: Should default to 3 days before due date with option for 1-day second reminder.
2. **Backup Extension**: Encrypted backup container shall use `.ftb` extension.

---

## 13. Risk Register

| Risk ID | Risk Description | Severity | Mitigation |
|---|---|---|---|
| **RSK-6.1** | Naive offline sync overwrites local edits | HIGH | Strict append-only queue for transaction creations; timestamp merge in ADR-023 |
| **RSK-6.2** | Android 13+ permission rejection | MEDIUM | Pre-permission explanation dialog with settings fallback banner |
| **RSK-6.3** | Backup restore with stale schema | HIGH | Versioned container header validated before SQLite transaction execution |

---

## 14. Approval Gate

```text
==================================================
PHASE 6 DISCOVERY REVIEW STATUS: CONDITIONALLY APPROVED
==================================================
```

*Phase 6 Discovery artifact `docs/features/platform/phase_6_investigation_and_product_requirements.md` will be updated with the required changes before proceeding to Phase 6 Information Architecture & Scope Boundary.*
