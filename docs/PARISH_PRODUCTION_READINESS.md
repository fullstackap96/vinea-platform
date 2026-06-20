# Parish Production Readiness

Use this checklist before enabling a parish on Vinea.

## Staff Access

Vinea dashboard access is limited to signed-in users who are explicitly authorized as staff.
After the first admin is bootstrapped, parish admins can manage staff access from
`/dashboard/settings`.

1. Create the parish's first Supabase Auth user.
2. Add that email to `staff_users` for the parish before sending the login link:

```sql
insert into public.staff_users (parish_id, email, role, active)
select id, 'admin@example.com', 'admin', true
from public.parishes
order by created_at asc
limit 1
on conflict (parish_id, email) do update
set role = excluded.role,
    active = true,
    updated_at = now();
```

3. Sign in as that admin and add the remaining staff users in Parish Settings.
4. Optionally set `STAFF_ALLOWLIST_EMAILS` in Vercel as a comma-separated emergency/admin allowlist.
5. Confirm an unauthorized Auth user is redirected to `/login?staff=unauthorized`.

## First-Run Setup

Start in `/dashboard/onboarding`, then use `/dashboard/settings` for the underlying controls.

The onboarding page tracks:

- Parish name and notification inbox.
- Daily brief recipient and schedule.
- Staff login access.
- Priest and staff display-name lists.
- Parish response targets for first contact and ownership.

Mark onboarding complete from `/dashboard/onboarding` after these items are reviewed.

## Public Intake

Public baptism, funeral, wedding, OCIA, and join-parish forms now submit through `/api/intake`.
Direct anonymous browser writes to parish data tables should remain disabled.

Confirm:

- Request forms can create new requests.
- Spam-rate limiting returns `429` after repeated rapid submissions.
- Parish staff can still see new requests in the dashboard.

## Deployment Verification

Run these checks before handing the system to parish staff:

```bash
npm.cmd run build
npm.cmd test
npm.cmd run lint
```

The current lint baseline allows warnings, but there should be no errors.
