# Disposable Supabase rls_disabled_in_public Fix Evidence

Date: 2026-06-30

## Alert

- Source: Supabase security advisor email.
- Advisor issue: `rls_disabled_in_public`.
- Project name: `vinea-disposable-public-intake-routing-qa`.
- Project ref: `kikqtorplsswepqitjys`.
- Production touched: No.
- Shared QA touched: No.

## Diagnosis

The disposable project had one public application table with Row Level Security disabled:

- `public.parishes`

All other non-extension-owned public application tables checked by the guarded script already had RLS enabled.

## Fix Applied to Disposable Project

The guarded disposable-only script was run against only `db.kikqtorplsswepqitjys.supabase.co` with explicit confirmation.

Result:

- `public.parishes` had RLS enabled.
- `parishes_select_authorized_staff` was installed for authenticated staff reads scoped through `public.is_authorized_for_parish(id)`.
- Final `remainingRlsDisabledTables` result was empty.
- No production database was accessed.
- No shared QA database was accessed.
- No secrets were committed or printed in evidence.

## Repo Prevention

Added migration:

- `supabase/migrations/20260630170000_enable_parishes_rls.sql`

The migration:

- Enables RLS on `public.parishes`.
- Adds an authenticated staff read policy scoped through `public.is_authorized_for_parish(id)`.
- Does not grant anonymous access.
- Does not grant broad write access.
- Preserves service-role server access for privileged app workflows.

## What Changed Plain English

Supabase warned that one table in the disposable QA database could be accessed without the usual row-level safety switch enabled. The affected table was the parish list table. I turned that safety switch on in the disposable project and added a migration so future disposable database rebuilds turn it on automatically.

## Follow-Up

Supabase advisor emails and dashboard checks can lag. If the alert still appears, re-run the Supabase security advisor check or click the advisor's resolve/recheck action for project `kikqtorplsswepqitjys`.
