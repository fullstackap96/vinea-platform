# Google OAuth Selected-Parish Persistence Boundary - 2026-07-11

Status: Implemented and locally verified with synthetic provider responses only.

## What Changed

The Google OAuth callback already required authenticated staff, signed OAuth state, and membership-backed selected-parish authorization before token exchange and integration persistence. It now also:

- selects only `parish_id` after the `parish_google_integrations` upsert;
- requires the returned parish id to equal the signed, revalidated active parish id;
- treats returned database errors, thrown exceptions, accepted zero-row responses, and mismatched parish responses as connection failures; and
- redirects to `gcal=connected` only after exact selected-parish persistence is confirmed.

Failure continues to clear the short-lived OAuth state cookie, redirect to `gcal=error`, and use privacy-safe error logging without refresh tokens, access tokens, account email values, raw parish ids, OAuth codes, provider payloads, or database details.

## Plain-English Summary

Vinea no longer tells staff that Google Calendar connected merely because the database accepted an upsert request. It confirms that the connection was stored for the exact parish the staff member selected before showing the polished connected state.

## Verification

Focused tests use synthetic tokens and mocked database/provider clients. They prove:

- exact selected-parish persistence reaches the connected redirect;
- an accepted zero-row response reaches the generic error redirect;
- a returned different-parish row reaches the generic error redirect;
- no real Google or database request occurs; and
- existing signed-state, membership, side-effecting GET, safe-log, and completed non-production QA evidence boundaries remain intact.

## Preserved Boundaries

- No production or shared-QA access.
- No real OAuth exchange, Google user-info request, Calendar call, or integration write.
- No migration or operational RLS change.
- No production flag, export, AI call, storage access, signed URL, communication, certificate action, record mutation, or public trust claim.

Rollback is code-only. Restore the prior upsert response handling; no database rollback is involved.
