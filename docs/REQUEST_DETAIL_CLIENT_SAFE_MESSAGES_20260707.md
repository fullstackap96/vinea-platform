# Request Detail Client Safe Messages - 2026-07-07

Status: Implemented as a scoped staff-facing production-readiness hardening slice.

## Summary

The request detail page now routes repeated client-visible failure messages through `lib/requestDetailClientMessages.ts` instead of rendering raw database, provider, network, AI, email, or Google Calendar exception text.

The request access check and request activity loader also route failed API response text through a small allowlist before showing it to staff.

The request detail subcomponents now use the same curated message helper for intake-detail save failures and the "waiting for" save/clear controls.

## Covered Areas

- Activity loading fallback.
- Request access verification fallback.
- AI summary and AI reply draft failure text.
- Template draft save failure text.
- Staff notes, intake details, waiting-for blockers, suggested dates, confirmed date, funeral, wedding, and OCIA schedule/details save failures.
- Communication logging and summary-update partial failure text.
- Email send, sent-email logging, and sent-email summary-update failure text.
- Google Calendar create/update/delete generic failure text, while preserving the existing OAuth reconnect guidance.

## Safety Boundary

This change does not alter staff authentication, request authorization, selected active parish scope, request data loading, AI gates, OpenAI behavior, email delivery behavior, communication logging semantics, Google Calendar event behavior, OAuth reconnect detection, document behavior, storage, signed URLs, production flags, production access, migrations, operational RLS, exports, public intake routing, certificate generation, automation, or public trust-center claims.

## Manual QA

In safe non-production:

1. Open a same-parish request detail page.
2. Confirm existing successful staff actions still show their normal success messages.
3. Force or simulate a failed staff-note/intake-detail/waiting-for/date/detail/communication save if practical.
4. Confirm the visible message is plain-English generic guidance and does not show database URLs, raw provider payloads, emails, token material, signed URLs, storage paths, stack traces, or raw IDs.
5. Confirm Google Calendar OAuth reconnect errors still show the reconnect guidance.

Do not use production records or real private documents for this check.
