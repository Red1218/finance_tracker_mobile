# Finance Tracker

A production-oriented personal finance mobile application built with React Native, Expo Router, TypeScript, and Supabase.

---

## Project Status

Current Phase: **Phase 6 — Platform & Operations** (In Progress)

For the detailed current project status, test suite baselines, and active milestone tracking, see:

👉 **[docs/status/PROJECT_STATUS.md](./docs/status/PROJECT_STATUS.md)**

---

## Features

- **Dashboard**: Financial health overview, monthly budget progress cards, income/expense cards, and recent activity.
- **Transactions & Single Ledger**: Multi-account transaction creation, spends tracking, detail sheet, transfers, and single-ledger persistence (`INCOME`, `EXPENSE`, `TRANSFER`).
- **Budgets & Circular Progress**: Overall and category-specific budget limits, visual circular progress indicators, and spending threshold alerts.
- **Bills & Recurring Payments**: Bill payment tracking, recurrence rules, mark-paid workflow, and upcoming bill reminders.
- **Accounts & Categories**: Multi-account management (checking, savings, credit, cash), masked balances, and category management (icons, colors, archive/restore).
- **Analytics & Reporting**: Interactive spending charts, month-over-month comparisons, category breakdown, and PDF/CSV report exports.
- **AI Insights & Anomaly Detection**: Rule-based spending anomaly detection, cash flow forecasting, and automated insight recommendations.
- **Cloud Sync & Conflict Resolution**: Offline-first operation, sync queue, and deterministic multi-device conflict resolution.
- **Backup & Encryption**: Authenticated encrypted snapshot export and import restoration.
- **Preferences & Customization**: Notification preferences, dark/light theme switching, and default currency selection.

---

## Technology Stack

- **Core**: React Native (0.83), React (19), TypeScript (5.9)
- **Framework & Routing**: Expo (v55), Expo Router (v55), `expo-dev-client`
- **Styling & UI**: NativeWind (v4), Tailwind CSS, Lucide Icons, `react-native-reanimated`, `react-native-gifted-charts`
- **State & Data Fetching**: TanStack React Query (v5), React Hook Form, Zod
- **Backend & Database**: Supabase PostgreSQL, Row Level Security (`FORCE ROW LEVEL SECURITY`), Supabase Auth
- **Security & Storage**: Expo SecureStore (encrypted auth tokens), AsyncStorage
- **Testing & Tooling**: Vitest, React Native Testing Library, TypeScript (`tsc`), Expo Doctor

---

## Prerequisites

- **Node.js**: v18 or higher (LTS recommended)
- **npm**: v9 or higher
- **Android Development** (optional for Web / Expo Go):
  - Android Studio
  - Android SDK (API 34/35) & Build Tools
  - Java Development Kit (JDK 17)
  - Android Virtual Device (AVD) emulator or connected Android device with USB Debugging

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd finance_tracker_mobile

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Set environment variables in `.env` (or pass via environment):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
EXPO_PUBLIC_SUPABASE_PROJECT_ID=<your-project-id>
```

---

## Development

Start the Metro development server:

```bash
npm start
# or: npx expo start
```

Press `a` to open in Android Emulator, `w` for Web, or scan the QR code with Expo Go on a physical device.

---

## Android Development Workflow

The project uses Expo native modules (`expo-secure-store`, `expo-file-system`, `expo-notifications`, `react-native-android-sms-listener`).

- **Full Native Android Build & Run**:
  ```bash
  npm run android
  # or: npx expo run:android
  ```
  *Use this when*: Native dependencies change, prebuild configs are updated, or launching a native debug APK on an emulator or physical device. Requires Android SDK and active emulator/device.

- **JS Live Reloading & Dev Server**:
  ```bash
  npm start
  # or: npx expo start
  ```
  *Use this when*: Developing UI components, hooks, business logic, or tests while an existing development build is already running on device/emulator.

---

## Testing & Verification

Run project verification commands:

```bash
# Run unit & integration tests (Vitest)
npm test

# Run Vitest in watch mode
npm run test:watch

# Run TypeScript static type check
npx tsc --noEmit

# Run Expo health check
npx expo-doctor
```

*For current baseline test metrics, see [docs/status/PROJECT_STATUS.md](./docs/status/PROJECT_STATUS.md).*

---

## Architecture & Governance

Finance Tracker strictly enforces **Clean Architecture**, **Domain-Driven Design (DDD)**, and **SOLID** principles.

```text
UI → React Query / DTO → Use Case Service → Repository Port → Supabase → PostgreSQL + RLS
```

- **Routing Boundary**: Root `app/` directory is reserved for Expo Router route files only (`_layout.tsx`, screen routes). Logic and features reside inside role-based directories (`src/features/<feature>/`, `src/platform/`).
- **Security & Multi-Tenancy**: Data isolation is enforced at the database level via Supabase Row Level Security (`auth.uid()`).
- **Persistence Model**: Single `transactions` table serves as the aggregate root for all financial ledger entries.

For full architectural specifications, see:
- [docs/PROJECT_CONSTITUTION.md](./docs/PROJECT_CONSTITUTION.md) — Architectural Principles & Standards
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System Layers & Import Boundaries (**Approved & Frozen 🔒**)
- [docs/PERSISTENCE_ARCHITECTURE.md](./docs/PERSISTENCE_ARCHITECTURE.md) — Database Schema & Single Ledger Spec (**Approved & Frozen 🔒**)

---

## Documentation Index

For complete project documentation, see the master documentation navigation index:

👉 **[docs/README.md](./docs/README.md)**

Key Documentation Directories:
- **`docs/status/`**: Single authoritative living current-state status record ([PROJECT_STATUS.md](./docs/status/PROJECT_STATUS.md))
- **`docs/adr/`**: Architectural Decision Records ([INDEX.md](./docs/adr/INDEX.md))
- **`docs/features/`**: Specifications for all 12 bounded contexts
- **`docs/ui/`**: UI component system, design system, and accessibility specs
- **`docs/operations/`**: Release runbooks, build profiles, and deployment guides
- **`docs/history/`**: Archived execution records of completed refactor phases

---

## AI Agent Guidance

AI coding agents working on this codebase must strictly follow **[AGENTS.md](./AGENTS.md)**.

- Root `AGENTS.md` is the **single authoritative instruction file** for AI behavior and rules.
- Do not call Supabase or native APIs directly from React presentation components.
- Obey Expo Router route boundaries (`app/` for route entry points only).

---

## Contributing

See **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** for git branch strategy, commit message conventions, pull request workflows, and Definition of Done.
