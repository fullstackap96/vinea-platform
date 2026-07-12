# Notifications Center Latest Response Boundary - 2026-07-11

Status: `NOTIFICATIONS_CENTER_LATEST_RESPONSE_IMPLEMENTED_20260711`

## What Changed

- Initial attention loading and open-panel refresh now share one latest-request-wins sequence.
- Starting a newer refresh aborts the older browser request immediately.
- Only the newest owned response may replace badge counts, attention rows, errors, or loading state.
- Selected-parish shell remount invalidates and cancels outgoing notification work.
- The client validates counts, groups, labels, context, flags, and dashboard-internal links before rendering.
- Malformed responses fail closed with calm retry guidance instead of breaking the staff shell.
- The trigger exposes its loading state through `aria-busy`.

## Plain-English Result

The Needs attention panel now shows the newest verified parish work only. Opening the panel while its background refresh is still running cannot let the older result jump back onto the screen.

## Preserved Boundaries

- The existing authenticated active-parish Notifications API remains authoritative.
- The panel remains read-only.
- No notification or record mutation occurred.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No communication, provider, Calendar, AI, export, storage, or signed-URL action occurred.

## Rollback

Revert the response parser and sequence/abort coordination. No data, schema, environment, or feature-flag rollback is required.
