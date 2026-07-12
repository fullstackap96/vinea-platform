# Dashboard Shell Client Safe Messages

Decision: `DASHBOARD_SHELL_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260710`

Status: `IMPLEMENTED - STAFF CLIENT ERROR AND WARNING REDACTION`

Date: 2026-07-10

## Scope

The dashboard parish switcher, Global Search, and Notifications Center now validate server-returned error and warning text before it reaches staff-visible UI.

Approved selected-parish authorization guidance and action-specific sign-in guidance remain visible. Unexpected database text, raw identifiers, private contacts, credential material, object errors, and future unreviewed server messages use stable staff-facing fallbacks.

## Preserved Behavior

- Parish switching still uses the existing membership-aware Server Action and active-parish cookie.
- Global Search and Notifications Center still use their existing authenticated, active-parish-aware API/loaders.
- Search results, notification rows, selected-parish labels, navigation, and refresh behavior are unchanged.
- No server query, authentication, authorization, mutation, or production gate behavior changed.

## Verification Boundary

- Focused helper/source tests cover initial parish-switcher errors and warnings, parish-switch action errors, Global Search errors and partial-result warnings, and Notifications Center errors.
- No production environment is accessed.
- No migration, operational RLS change, production flag, external send, record mutation, AI call, export, storage access, signed URL, certificate generation, or public trust claim is made.

Production-sensitive features approved by this boundary: `NO`.

Public trust claims approved by this boundary: `NO`.

## Verification Results

- Integrated dashboard-shell, Calendar-link, and release-evidence suite: `11 test files / 30 tests passed`.
- Full Vitest regression suite: `669 test files / 2,635 tests passed`.
- All-file TypeScript and quiet lint: `PASS`.
- Repository secret scan: `1,825 text files / 26 binaries skipped / 0 findings`; matched values printed: `NO`.
- Release handoff validation: `70 artifacts / 16 CI commands / 15 locked gates / 0 findings`.
- Completed local evidence validation: `430 required phrases / 0 findings`.
- Next.js production build: `PASS` with Next.js `16.2.10` and all `53` static pages generated.
