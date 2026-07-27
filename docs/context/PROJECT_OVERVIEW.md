# Project Overview

## Project Vision
To provide a comprehensive, intuitive, and privacy-first mobile finance tracking application that empowers users to take control of their personal finances.

## Target Users
Individuals looking for a reliable, offline-first personal finance manager to track budgets, expenses, and overall financial health.

## Problems Being Solved
- Fragmented personal finance tracking.
- Lack of offline functionality in modern finance apps.
- Data privacy concerns with cloud-only solutions.

## Core Principles
- Privacy by design.
- Local-first data ownership.
- Seamless offline and online synchronization.
- Simplicity and speed of data entry.

## Product Philosophy
Empower the user with their data. The application should be fast, reliable, and functional even without an internet connection.

## Technology Stack
- **Frontend**: React Native / Expo
- **Language**: TypeScript
- **State Management**: React Query (TanStack Query) / Zustand
- **Database**: Local SQLite / WatermelonDB
- **Authentication**: Unknown
- **UI Framework**: NativeWind / Custom React Native Styles

## Architecture Style
Clean Architecture / Feature-Sliced Design.
Offline-first mobile application architecture.

## Offline/Online Strategy
Local-first storage with background synchronization to a remote server when online.

## Database
PostgreSQL (Supabase) with Row Level Security (RLS) and single `transactions` ledger as canonical record. See [PERSISTENCE_ARCHITECTURE.md](../PERSISTENCE_ARCHITECTURE.md).

## Authentication
Supabase Auth with JWT and `expo-secure-store`.

## State Management
TanStack Query (React Query) / React Context

## UI Framework
React Native + Expo Router

## Major Modules / Bounded Contexts
- Accounts (Cash, Bank, Credit Card, Wallet)
- Categories (Typed Income/Expense classification)
- Transactions (Canonical ledger: Expense, Income, Transfer Out, Transfer In)
- Budgets (Planning and expense goal calculation)
- Preferences (User runtime settings)
- Reporting & Analytics
- Cloud Sync Engine

## Future Vision
To incorporate intelligent categorization, receipt scanning, and end-to-end encrypted cloud backups without compromising user privacy.

---
**Last Updated**: 2026-07-27
**Owner**: Development Team
**Related Documents**: [AI_INDEX.md](file:///d:/Projects/finance_tracker_mobile/docs/AI_INDEX.md), [PERSISTENCE_ARCHITECTURE.md](file:///d:/Projects/finance_tracker_mobile/docs/PERSISTENCE_ARCHITECTURE.md)
