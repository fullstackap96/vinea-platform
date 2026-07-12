# Daily Brief Selected-Parish Loader Cleanup - 2026-07-08

Status: Implemented as a safe multi-parish tenant-readiness cleanup.

## What Changed

- Removed the unused `loadPrimaryParishDailyBrief(...)` helper.
- Kept manual daily brief sending on `loadParishDailyBriefByParishId(...)` with the selected active parish id.
- Kept cron daily brief sending on `loadEnabledParishDailyBriefs(...)` for all enabled parishes.
- Added a source guard so the primary-parish daily brief loader does not return.

## Why This Matters

Manual daily brief sends are a selected-parish staff action. Vinea should not keep an unused helper that quietly chooses the first parish by creation date, because that kind of legacy helper can be accidentally reused during future multi-parish work.

## Safety Boundary

- No production access.
- No migrations.
- No operational RLS changes.
- No email sending.
- No record mutation.
- No Google Calendar data touch.
- No exports.
- No AI calls.
- No storage or signed URL access.
- No public trust claims.

## Verification

- Focused route/source tests prove manual daily brief sends use active parish context and explicit parish-id loading.
- Focused route/source tests prove cron daily brief sends remain all-enabled-parish scoped.
- Focused route/source tests prove `loadPrimaryParishDailyBrief` is absent from the loader.

## Follow-Up

Continue reviewing old first-row fallback helpers and preserve only those that are explicitly part of documented compatibility behavior.
