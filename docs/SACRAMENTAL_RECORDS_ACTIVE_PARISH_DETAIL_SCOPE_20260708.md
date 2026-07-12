# SACRAMENTAL_RECORDS_ACTIVE_PARISH_DETAIL_SCOPE_20260708

Status: Implemented as SERVER-SCOPED SACRAMENTAL RECORD DETAIL/EDIT HARDENING.

## What Changed

- Sacramental Record detail and edit routes now load records through `lib/server/loadSacramentalRecordDetail.ts`.
- The server loader requires staff authentication, resolves the selected active parish, and scopes the record, linked person, recent activity, and person-picker options to that parish.
- Sacramental Record update and person-link actions now use staff write parish context before updating rows.
- Person-link changes verify the selected person belongs to the same selected parish before saving the link.

## Safety Boundary

This slice is read/write-scope hardening only. It does not change operational RLS, apply migrations, access production, generate certificates automatically, mutate canonical notation workflows, send communications, call AI, run exports, access storage, create signed URLs, or make public trust claims.

## Verification

Focused tests cover the active-parish server loader, route source boundaries, and selected-parish write scoping. Full verification is recorded in `docs/VINEA_BUILD_STATUS.md`.
