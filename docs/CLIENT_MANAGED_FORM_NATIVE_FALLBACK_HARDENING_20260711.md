# Client-Managed Form Native Fallback Hardening - 2026-07-11

Completion marker: `CLIENT_MANAGED_FORM_NATIVE_FALLBACK_HARDENING_20260711`

Status: `IMPLEMENTED_AND_VERIFIED`

## Why This Exists

React `onSubmit` handlers do not run until the page hydrates. Without an explicit HTML method, an early native form submission defaults to GET and can place entered fields in browser history, query strings, referrers, screenshots, or logs.

## Implemented Boundary

Every Vinea `<form>` that declares an `onSubmit` handler now also declares `method="post"`. This covers:

- public Baptism, Funeral, Wedding, OCIA, and Join Parish intake forms;
- the Schedule Demo form;
- staff login;
- family document upload;
- staff-reviewed People, Household, Sacramental Record, Mass Intention, care-plan, Settings, and request-document forms.

The normal hydrated handlers, validation, active-parish authorization, provider behavior, and mutation routes are unchanged. Intentional read-only search/filter forms may continue to use GET.

Staff login has the additional stronger boundary of rendering submit disabled until hydration completes.

## Regression Guard

`lib/server/clientManagedFormNativeFallbackGuard.test.ts` parses every App Router TSX file with the TypeScript AST. Any future real `<form>` with an `onSubmit` attribute fails unless its literal method is `post`.

## Verification

- AST fallback guard: PASS
- Staff-login source checks: PASS
- TypeScript: PASS
- ESLint: PASS
- Production build: PASS
- Full repository regression: PASS

## Production Boundary

This is application hardening, not approval for production-sensitive features. No production access, flag enablement, migration, operational RLS change, provider call, export, AI call, storage operation, or public trust claim was performed.
