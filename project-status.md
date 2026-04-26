# Project Status — Vinea Platform

This document describes the **current working state** of the app (Next.js + Supabase), including routes, database tables used, major features, environment variables (names only), known limitations, and recommended next steps.

**Demo & pilot:** see [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) and [docs/DEMO_PILOT_RUNBOOK.md](docs/DEMO_PILOT_RUNBOOK.md).

## Routes

### Public pages

- **`/`** — Marketing landing (Vinea Platform, intake links, staff sign-in).
- **`/baptism-request`** — Public baptism intake form.
- **`/funeral-request`** — Public funeral intake form.
- **`/wedding-request`** — Public wedding intake form.
- **`/login`** — Staff login (email/password, Supabase Auth).

### Protected pages (auth required)

- **`/dashboard`** — Staff home: request list, status filters, follow-up / metrics views.
- **`/dashboard/requests/[id]`** — Request detail: summary by type, status, checklist, type-specific scheduling sections, communication log, staff notes, AI tools, send email, Google Calendar actions.

### API routes (server)

- **`POST /api/ai/summary`** — OpenAI: internal staff summary.
- **`POST /api/ai/reply`** — OpenAI: draft reply email body.
- **`POST /api/email/send`** — Outbound email (Resend when configured).
- **`POST /api/google/calendar-event/create`** — Create calendar event from confirmed schedule (when OAuth env configured).
- **`POST /api/google/calendar-event/update`** — Update linked calendar event.
- **`POST /api/google/calendar-event/delete`** — Delete linked calendar event and clear link.

## Database tables used (Supabase)

The app reads/writes these tables (and related columns) via the Supabase client:

- **`parishioners`** — Contact name, email, phone; linked from `requests.parishioner_id`.
- **`requests`** — `request_type` (`baptism` | `funeral` | `wedding`), status, baptism fields (`child_name`, `preferred_dates`, `confirmed_baptism_date`, suggested dates), notes, communication summary fields, `staff_notes`, `ai_summary`, `reply_draft`, Google Calendar ids/links, timestamps.
- **`checklist_items`** — Per-request checklist rows (`item_name`, `is_complete`).
- **`request_communications`** — Communication history (`contacted_at`, `method`, `notes`).
- **`funeral_request_details`** — Funeral-specific fields (deceased, date of death, funeral home, notes, confirmed service time); keyed by `request_id`.
- **`wedding_request_details`** — Wedding-specific fields (partners, proposed date, ceremony notes, confirmed ceremony time); keyed by `request_id`.

## Major features

### Intake (public)

- **Baptism**, **funeral**, and **wedding** forms create `parishioners` + `requests` (and type-specific detail rows / default checklist items as implemented per form).

### Staff dashboard (protected)

- Request list with filters (e.g. by status).
- Links to request detail; demo banner when `NEXT_PUBLIC_DEMO_SITE=1` (see `app/dashboard/layout.tsx`).

### Request workflow (protected)

On **`/dashboard/requests/[id]`** staff can (by request type):

- View parishioner + request summary (including funeral/wedding detail fields when applicable).
- Update **status** (e.g. new / in progress / complete).
- Toggle **checklist** items.
- **Baptism:** suggested dates, confirmed baptism date (with clear).
- **Funeral:** funeral details form, confirmed funeral service time (with clear).
- **Wedding:** wedding details form, confirmed wedding ceremony time (with clear).
- **Communication:** last-contact summary, log new communication, view **history**.
- **Internal staff notes** — persist to `requests.staff_notes`.
- **AI tools** — generate summary / reply draft; copy reply draft.
- **Send email** — send draft via configured provider.
- **Google Calendar** — create / update / delete linked event when integration is configured.

### Authentication (v1)

- Email/password via Supabase Auth on `/login`.
- Middleware protects **`/dashboard/:path*`**; unauthenticated users redirect to `/login?next=…`.
- Logout on dashboard layout header.

## Environment variables in use (names only)

**Core**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**AI**

- `OPENAI_API_KEY`

**Email (optional)**

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `DEMO_REQUEST_TO_EMAIL`

**Google Calendar (optional)**

- `GOOGLE_CALENDAR_ID`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

**Demo presentation**

- `NEXT_PUBLIC_DEMO_SITE` — set to `1` to show the demo environment banner on dashboard pages.

## Known limitations / technical debt

- **No role model yet (“staff” = any authenticated user)**: no allowlist/roles/permissions beyond “logged in”.
- **AI and some API routes are not session-protected in the same way as dashboard pages**: treat keys and network exposure accordingly (see code under `app/api/`).
- **Client-side Supabase reads/writes**: dashboard and intake use the browser client directly. RLS/policy changes can break pages unexpectedly.
- **Type safety is minimal**: several components use `any` for Supabase payloads and errors.
- **Duplicate UI block**: request detail may still contain duplicated “Internal Staff Notes” presentation (cleanup deferred).
- **Next.js**: middleware convention may change in future Next releases; upgrade risk.

## Next recommended features

- **Protect AI (and sensitive) endpoints** — Require authenticated staff (e.g. session + allowlist) for `/api/ai/*` and related routes.
- **Staff authorization v2** — Allowlist by email or `staff_users` / role claims.
- **Audit + improve data access** — Server-side reads or dedicated write APIs where appropriate.
- **Type the data model** — Shared types for `requests`, `parishioners`, checklists, communications, detail tables.
- **UI cleanup** — Deduplicate notes UI on request detail.
- **Operational hardening** — Rate limiting on AI routes; error reporting for Supabase/OpenAI failures.
