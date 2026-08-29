---
status: active-living
authority: feature-authoritative
last_verified: 2026-08-29
---

# Finance Tracker — Operations & Release Documentation Index

This directory serves as the authoritative container for Finance Tracker deployment, build, environment provisioning, and release runbooks.

---

## 1. Overview & Purpose

The `docs/operations/` documentation area tracks operational procedures required to package, test, build, and deploy the Finance Tracker mobile application across staging and production environments.

---

## 2. Operational Areas & Document Status

| Operational Area | Description | Target Phase | Status |
|------------------|-------------|--------------|--------|
| **EAS Build Configuration** | Staging & production build profiles in `eas.json` for Android & iOS | Phase 6 | Planned / In Progress |
| **Environment Provisioning** | Managing `EXPO_PUBLIC_SUPABASE_URL` and publishable keys across environments | Phase 6 | Planned |
| **Native Push Notifications** | Push channel registration and APNs / FCM credential management | Phase 6 | Planned |
| **Android Release Runbook** | APK & AAB production build, keystore signing, and Google Play Store submission | Phase 6 | Planned |
| **iOS Release Runbook** | TestFlight distribution, provisioning profiles, and App Store submission | Phase 6 | Planned |

---

## 3. Current Operational Evidence in Codebase

Operational parameters currently established in the repository:

- **EAS Configuration**: [eas.json](../../eas.json) defines `development`, `preview` (Android APK), and `production` build profiles.
- **Expo Application Metadata**: [app.json](../../app.json) defines bundle identifier (`com.financetracker.mobile`), Android package (`com.finance.tracker`), permissions (`RECEIVE_SMS`, `READ_SMS`), and EAS project ID.
- **Environment Variables**: Environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_SUPABASE_PROJECT_ID`) are declared in `.env.example`.

---

## 4. Authoritative Specifications

For system architecture, security, and persistence specs, refer to:

- [docs/README.md](../README.md) — Master Documentation Index
- [docs/status/PROJECT_STATUS.md](../status/PROJECT_STATUS.md) — Current Project Status Snapshot
- [docs/ROADMAP.md](../ROADMAP.md) — Product Phase Roadmap
- [AGENTS.md](../../AGENTS.md) — Master AI Agent Instructions
