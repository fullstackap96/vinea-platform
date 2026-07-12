# Onboarding Selected-Parish Scope UX

Status: Completed as a safe non-production tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, runtime authorization behavior was not changed, and no secrets were exposed.

## What Changed

- Updated `app/dashboard/onboarding/ParishOnboardingPage.tsx`.
- Updated `app/dashboard/DashboardOnboardingCard.tsx`.
- Reused the parish name already returned by the active-parish-scoped `/api/parish/settings` response.
- Added a display-only `Onboarding is scoped to ...` label on the full parish onboarding checklist.
- Added a display-only `Setup is scoped to ...` label on the dashboard setup card.
- Cleared the selected-parish display label before each settings reload so stale parish names are not shown after a failed refresh.
- Kept onboarding completion, parish settings writes, staff-user loading, active parish authorization, migrations, operational RLS, Google Calendar, and production behavior unchanged.

## What Changed Plain English

The parish setup checklist now tells staff which parish it belongs to. If a staff member works across more than one parish, the setup card and setup page can confirm whether they are reviewing Parish A or Parish B before marking onboarding complete.

## Why This Matters

Onboarding controls readiness for daily parish operations. Showing the selected parish reduces the risk that a multi-parish staff member completes or reviews setup for the wrong parish, while keeping this phase limited to a display-only UI safety improvement.

## How To Test

1. Sign in to shared QA or another approved non-production staff account with access to more than one parish.
2. Open `/dashboard`.
3. If the setup card is visible, confirm it shows `Setup is scoped to <selected parish>.`
4. Open `/dashboard/onboarding`.
5. Confirm the page shows `Onboarding is scoped to <selected parish>.`
6. Switch to another authorized parish.
7. Confirm the dashboard and onboarding labels update to the newly selected parish.
8. Confirm no production data, migrations, operational RLS changes, Google Calendar data, record mutations, credentials, tokens, or signed URLs are involved.

## Known Risks

- This is a UX clarity improvement only. It does not promote production RLS.
- Browser QA should still verify the onboarding labels update after parish switching in shared QA or another approved non-production environment.
- Production RLS remains `NO-GO` until explicit approval, production target details, live smoke evidence, monitoring evidence, and rollback readiness are complete.

## Outcome

Current status: `ONBOARDING_SELECTED_PARISH_SCOPE_UX_COMPLETE_NON_PRODUCTION_SAFE`

The onboarding checklist now follows the same selected-parish clarity pattern already applied to Reports, Requests, Parish Care Calendar, Global Search, People, Households, Sacramental Records, Mass Intentions, Settings, Audit Log, Imports, Communications, Role Work Hub, and Notifications Center.
