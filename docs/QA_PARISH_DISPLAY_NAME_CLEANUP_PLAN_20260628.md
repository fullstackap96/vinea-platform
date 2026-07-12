# QA Parish Display Name Cleanup Plan

Status: Prepared only. Do not run against production. Do not run against shared QA until a human approves the exact non-production cleanup window.

## Purpose

The selected-parish switcher is now hardened to show distinct fallback labels when parish names are missing. The remaining cleanup is to fix the underlying synthetic QA parish fixture names so future manual QA is easier to read.

This plan covers only known non-production Google Calendar QA parish fixtures. It does not apply migrations, change operational RLS, touch production, or modify real parish data.

## Approved Scope

Allowed target:

- Shared QA Supabase project ref: `gnfomgsuottcuueasfvi`

Allowed table:

- `public.parishes`

Allowed columns:

- `name`
- `public_display_name`

Allowed source of target IDs:

- Repo-local ignored file: `.env.google-calendar-browser-qa.local`
- Required variables:
  - `QA_ACTIVE_PARISH_A_ID`
  - `QA_ACTIVE_PARISH_B_ID`

Allowed labels:

- `QA_ACTIVE_PARISH_A_ID` -> `Vinea QA Google Calendar Parish A`
- `QA_ACTIVE_PARISH_B_ID` -> `Vinea QA Google Calendar Parish B`

## Explicit Non-Goals

- Do not access production.
- Do not apply migrations.
- Do not change operational RLS.
- Do not touch Google Calendar.
- Do not create, update, or delete request records.
- Do not update staff, membership, parishioner, document, audit, or calendar integration records.
- Do not print Supabase keys, database URLs, staff passwords, OAuth tokens, refresh tokens, session cookies, or family portal tokens.

## Guardrails

The future cleanup script must:

1. Require `VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_CONFIRM=QA_PARISH_DISPLAY_NAME_CLEANUP`.
2. Refuse to run unless `NEXT_PUBLIC_SUPABASE_URL` points to `gnfomgsuottcuueasfvi.supabase.co`.
3. Refuse production-looking app hosts such as `vinea.app` or `*.vinea.app` if an app URL is available.
4. Read fixture IDs from `.env.google-calendar-browser-qa.local`.
5. Refuse missing, `NOT_AVAILABLE`, duplicate, or non-UUID fixture IDs.
6. Load only the approved parish rows by ID.
7. Default to dry-run.
8. Require `VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_EXECUTE=EXECUTE_QA_PARISH_DISPLAY_NAME_CLEANUP` before writing.
9. Update only `public.parishes.name` and `public.parishes.public_display_name` for the two approved fixture IDs.
10. Output sanitized JSON evidence that never includes secrets.

## Future Execution Steps

1. Confirm the app and database target are shared QA, not production.
2. Confirm `.env.google-calendar-browser-qa.local` contains the two safe parish fixture IDs.
3. Run the script in dry-run mode first.
4. Review sanitized JSON output:
   - target project ref
   - fixture variables present
   - intended labels
   - current label presence only
   - `dryRun: true`
   - `secretsPrinted: false`
5. If the dry-run output is correct, rerun with the execute variable.
6. Open the non-production Vinea parish switcher and verify:
   - Parish A displays as `Vinea QA Google Calendar Parish A`.
   - Parish B displays as `Vinea QA Google Calendar Parish B`.
   - Switching parish still changes selected-parish context.
7. Capture evidence in build status.

## Rollback

If cleanup causes confusion, rerun the same script with corrected labels or manually restore the previous QA-only labels in shared QA. No production rollback is involved because this plan must never run against production.

## Approval Status

Current status: `PREPARED_NOT_EXECUTED`

Blocked until:

- Product owner approves shared-QA fixture cleanup.
- Dry-run evidence is reviewed.
- Execute mode is explicitly approved for shared QA.
