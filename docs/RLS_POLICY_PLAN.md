# RLS Policy Plan — Vinea Platform

**Status: PLAN ONLY — not applied.** No new RLS migration has been added for this plan. Application behavior is unchanged until implementation.

**Related:** [RLS testing checklist](#rls-testing-checklist-before-implementation) (below).

---

## Implementation status

| Item | State |
|------|--------|
| New RLS SQL migrations for this plan | **Not applied** |
| `parish_staff` (or equivalent) table | **Not created** |
| App code changes for RLS | **None** (for Recommendation 3) |
| Existing repo policies | Pre-existing only: `request_notes_*`, `parishioners_update_authenticated`; detail tables have RLS enabled with policies commented or absent |

---

## Prerequisites (before any RLS SQL)

1. **`parish_staff`** — `user_id` → `auth.users`, `parish_id` → `parishes`, optional `role` (`admin` | `staff` | `viewer`).
2. **SQL helpers** — e.g. `user_parish_ids()`, `request_in_user_parish(request_id)`, `default_parish_id()` for intake.
3. **Backfill** `parishioners.parish_id`; intake must set `parish_id` on new parishioners.
4. **Drop/replace** global policies: `request_notes_*` (`USING (true)`), `parishioners_update_authenticated` (`USING (true)`).
5. **Auth lockdown** — invite-only sign-up; every staff Auth user has a `parish_staff` row.

---

## User-to-parish mapping (current vs planned)

| Today | Planned |
|-------|---------|
| No `auth.uid()` → parish link | `parish_staff.user_id` + `parish_staff.parish_id` |
| “Parish” = oldest `parishes` row (`fetchPrimaryParishId`) | RLS uses `user_parish_ids()` from `parish_staff` |
| Any logged-in user = staff | Only users with a membership row |
| `assigned_staff_name` on `requests` | Display only; **not** authorization |

---

## Table coverage (every Supabase table used by the app)

| Table | In app | Parish ownership | RLS in repo today | Planned |
|-------|--------|------------------|-------------------|---------|
| `parishes` | Yes | Root tenant (`id`) | Not enabled in migrations | Enable; staff SELECT; UPDATE admin or service role only |
| `parish_google_integrations` | Yes (server) | `parish_id` PK → `parishes` | Enabled; **no user policies** | **Deny all** `anon`/`authenticated`; **service role only** |
| `parishioners` | Yes | `parish_id` → `parishes` | Partial (`UPDATE` global) | Parish-scoped SELECT/UPDATE; anon INSERT with `default_parish_id()` |
| `requests` | Yes | Via `parishioner_id` → `parishioners.parish_id` | Not in repo | Parish-scoped staff; anon INSERT with checks |
| `request_notes` | Yes | Via `request_id` → requests chain | Permissive `authenticated` | Scope by `request_in_user_parish`; append-only |
| `request_communications` | Yes | Via `request_id` | Not in repo | Staff parish scope; anon deny |
| `checklist_items` | Yes | Via `request_id` | Not in repo | Anon INSERT on intake; staff UPDATE |
| `funeral_request_details` | Yes | Via `request_id` | RLS on; policies commented | Mirror requests |
| `wedding_request_details` | Yes | Via `request_id` | RLS on; policies commented | Mirror requests |
| `ocia_request_details` | Yes | Via `request_id` | RLS on; no policies | Mirror requests |
| `join_parish_request_details` | Yes | Via `request_id` | RLS on; no policies | Mirror requests |
| `parish_staff` | **Proposed** | `user_id` + `parish_id` | N/A | Enable; users read own rows; writes via admin/service role |

**Not app tables:** `auth.users` (Supabase Auth). Manage sign-up separately.

**Legacy note:** `requests`, `parishioners`, `checklist_items`, and `request_communications` are used by the app but not created in this repo’s migrations; confirm live Supabase RLS before rollout.

---

## Sensitive tables

| Table | Sensitivity | Policy direction |
|-------|-------------|------------------|
| **`parish_google_integrations`** | **`refresh_token`**, calendar binding | **Never** expose to browser; service role only; optional non-secret view for status/email |
| `parishes` | `default_notification_email`, directories | Staff SELECT only for member parishes; no anon |
| `parishioners` | PII (name, email, phone) | No anon SELECT |
| `requests` | Pastoral workflow, AI drafts, calendar ids | Staff parish scope; restrict anon INSERT columns |
| `request_notes` | Internal staff content | Staff scope only; no anon |

---

## Per-table policy summary (draft — do not run yet)

### `parish_staff` (new)

| Op | Policy |
|----|--------|
| RLS | On |
| SELECT | `user_id = auth.uid()` |
| INSERT/UPDATE/DELETE | Service role or parish `admin` |
| Service role | Bootstrap memberships |

### `parishes`

| Op | Policy |
|----|--------|
| RLS | On |
| SELECT | `id IN user_parish_ids()` |
| INSERT | Service role |
| UPDATE | Admin on parish, or service role only (settings API) |
| DELETE | Deny (client) |

### `parish_google_integrations`

| Op | Policy |
|----|--------|
| RLS | On |
| SELECT/INSERT/UPDATE/DELETE | **Deny** `anon` + `authenticated` |
| Service role | OAuth callback, calendar error updates, server reads |

### `parishioners`

| Op | Policy |
|----|--------|
| RLS | On |
| SELECT | Staff: `parish_id IN user_parish_ids()` |
| INSERT | Anon + staff with `parish_id = default_parish_id()` |
| UPDATE | Staff/admin, same parish |
| DELETE | Service role only |

### `requests`

| Op | Policy |
|----|--------|
| RLS | On |
| SELECT | Staff via parishioner chain |
| INSERT | Anon intake + staff; restrict writable columns for anon |
| UPDATE | Staff/admin in parish |
| DELETE | Deny client |

### `request_notes`, `request_communications`, `checklist_items`

| Op | Policy |
|----|--------|
| RLS | On |
| SELECT | `request_in_user_parish(request_id)` |
| INSERT | Staff (+ anon for checklist on intake where applicable) |
| UPDATE | Checklist: staff; communications: deny or admin |
| DELETE | Deny (default) |

### `*_request_details` (funeral, wedding, ocia, join_parish)

| Op | Policy |
|----|--------|
| RLS | On (already) |
| SELECT/UPDATE | Staff via `request_id` |
| INSERT | Anon intake + staff |
| DELETE | Deny client |

---

## Service-role-only operations (unchanged by RLS; document for QA)

- `parish_google_integrations` read/write (tokens)
- Parish settings `PATCH` / primary parish load (if not admin RLS)
- `POST /api/request-notifications` parish email fallback
- Google OAuth callback upsert

---

## Security concerns (plan must address)

- No user→parish mapping today → **`parish_staff` required**
- Dashboard may skip parish filter if `fetchPrimaryParishId` fails → app + RLS must fail closed
- Request detail parish check is UI-only today → RLS must enforce
- Public routes: `/api/ai/summary`, `/api/request-notifications` — **not fixed by table RLS**; separate hardening
- Intake without `parish_id` breaks staff visibility and parish policies

---

## Suggested rollout order

1. `parish_staff` + seed users  
2. Backfill / default `parishioners.parish_id`  
3. Helpers + `parishes` / `parish_google_integrations`  
4. Replace permissive policies (`request_notes`, `parishioners`)  
5. `requests` + child tables  
6. Run [testing checklist](#rls-testing-checklist-before-implementation) on staging  

---

## RLS testing checklist (before implementation)

Run on **staging** after policies are applied. Do not use production first.

### Prerequisites

- [ ] Staging Supabase with RLS + `parish_staff` deployed  
- [ ] Two parishes (A, B), staff users `staff-a` / `staff-b`, sample requests each  
- [ ] `parishioners.parish_id` set; intake sets `parish_id`  
- [ ] Resend/Google env if testing email/calendar routes  

### 1. Staff sees own parish requests

- [ ] `staff-a` → `/dashboard` shows only Parish A requests  
- [ ] Open Parish A request detail — full data loads  
- [ ] No RLS errors in console for allowed reads  

### 2. Staff cannot see other parish requests

- [ ] `staff-a` → direct URL to Parish B request → blocked / not found  
- [ ] Parish B names never on `staff-a` dashboard  
- [ ] `staff-b` does not see Parish A  
- [ ] Client UPDATE on Parish B request → 0 rows or error  

### 3. Public intake still works (logged out)

- [ ] `/baptism-request`, `/funeral-request`, `/wedding-request`, `/ocia-request`, `/join-parish-request` submit successfully  
- [ ] Rows in `parishioners`, `requests`, details, `checklist_items` as applicable  
- [ ] Staff for default parish sees new request on dashboard  
- [ ] Anon `requests.select()` → denied or empty  

### 4. Parish Settings (server routes)

- [ ] `/dashboard/settings` loads and saves (authenticated)  
- [ ] `GET/PATCH /api/parish/settings` → 200 with session; 401 without  

### 5. Request notes

- [ ] Staff adds note on own-parish request → persists  
- [ ] Staff cannot add note on other parish request  
- [ ] Anon cannot insert/read notes  

### 6. Email / calendar server routes

- [ ] `POST /api/email/send` works with staff session; 401 without  
- [ ] Google OAuth connect + create/update/delete calendar event (if configured)  
- [ ] `refresh_token` never in browser/network client payloads  

### 7. Unauthenticated dashboard access

- [ ] `/dashboard` and nested routes redirect to `/login` when logged out  
- [ ] Anon Supabase reads on operational tables fail  

### Sign-off

| Role | Date | Pass / fail |
|------|------|-------------|
| | | |

**Failure log:** (request IDs, users, errors, policy names)

---

## Document history

| Date | Change |
|------|--------|
| 2026-05-16 | Initial plan + checklist consolidated for Recommendation 3 QA (not applied) |
