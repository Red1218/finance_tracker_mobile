# ADR 018: Authentication Architecture Consolidation

**Status:** Accepted
**Date:** 2026-08

## Context

The application suffered from two disparate authentication systems:
1. `src/platform/authentication` (legacy, React Context-based singleton provider used by Expo Router).
2. `src/features/auth` (new, Clean Architecture + CQRS module used by the UI).

This led to an architectural violation where successful logins (via Clean Architecture) did not update the Router's state, causing redirect loops since the Router believed the user was still unauthenticated.

## Decision

We have decided to consolidate authentication under `src/features/auth` and delete the legacy `src/platform/authentication`.

To support Expo Router's reactive requirements without violating Clean Architecture, we implemented `useAppAuth.ts`, an adapter hook that bridges the `AuthController` singleton using React's `useSyncExternalStore`. 

## Consequences

- The `src/platform/authentication` module has been completely deleted.
- Single source of truth for authentication is established.
- The router correctly tracks the auth state via the new `useAppAuth` adapter.
- The `AuthProvider` React Context wrapper has been removed as the global singleton suffices.
