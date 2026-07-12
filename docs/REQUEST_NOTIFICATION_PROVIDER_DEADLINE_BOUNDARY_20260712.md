# Request Notification Provider Deadline Boundary

Decision: `REQUEST_NOTIFICATION_PROVIDER_DEADLINE_BOUNDARY_IMPLEMENTED_20260712`

Status: Implemented and verified locally for the post-intake staff notification route.

## What Changed

After durable rate limiting, bounded body parsing, and stored request verification succeed, `/api/request-notifications` now derives an opaque Resend idempotency key from the verified parish and request identities. Raw identifiers, contact details, intake notes, and token material are not included in the key.

The Resend request owns a 12-second abort signal. A non-empty provider message id remains required for success. If provider confirmation stalls, the route settles with the same generic notification failure used elsewhere; it does not expose provider details or claim delivery.

Repeated notification calls for the same verified parish/request pair reuse the provider key during Resend's retention window. A different parish or request produces a different key.

## Why This Matters

Public intake creation completes before this best-effort staff alert. Provider latency can no longer hold the browser workflow until the hosting function times out, and a repeated post-intake notification call is less likely to create duplicate office alerts. The saved intake remains successful and available to parish staff even when the alert fails.

## Preserved Boundaries

- Same-origin mutation protection, durable rate limiting, payload validation, stored request verification, parish-specific notification inbox selection, and provider message-id confirmation remain authoritative.
- Public forms still show success after the request itself is stored; notification failure is not presented as intake failure.
- This does not create a durable notification ledger or guarantee provider delivery.
- No real email was sent during verification.
- No production access, deployment, migration, operational RLS change, record mutation, production flag enablement, provider account access, or public trust claim occurred.

## Rollback And Verification

Rollback removes the helper and second provider-call options argument. No data rollback is required.

Focused tests use mocked provider delivery and verify tenant/request key separation, opaque key material, bounded signals, route ordering, generic timeout behavior, existing rate limits, and this documented boundary.
