# Data Import History Freshness Boundary - 2026-07-11

Status: `DATA_IMPORT_HISTORY_FRESHNESS_IMPLEMENTED_20260711`

## What Changed

- Initial history loading and post-commit history refresh now use one shared loader.
- The shared loader is latest-request-wins.
- Every history load gets a monotonically increasing sequence and its own abort controller.
- Starting a newer load cancels the older request immediately.
- Only the latest owned response may update Recent imports or the visible active-parish name.
- A selected-parish remount invalidates and aborts the outgoing client load.
- Expected cancellation stays quiet and cannot clear newer history.

## Plain-English Result

The Imports screen now shows evidence from the newest parish-aware refresh only. A slow older response cannot replace newer import history or put an old parish name back on the screen.

## Preserved Boundaries

- This changes read coordination only.
- Existing staff authentication, selected-parish scope, write authorization, reviewed-snapshot commit, and import behavior remain unchanged.
- No import or record mutation occurred during verification.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No provider, communication, Calendar, AI, export, or storage call occurred.

## Rollback

Revert the shared sequence/abort loader to the prior history fetch. No schema, environment, data, or feature-flag rollback is required.
