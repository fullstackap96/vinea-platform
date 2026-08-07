# Vinea AI Context

Last Generated: 2026-08-07

Confidence Level: High for code-derived details; Medium for product roadmap; Low for unstated business facts.

## Product Summary

Vinea Platform is a Next.js/Supabase SaaS app for Catholic parish operations. It helps parish teams manage public intake, staff ownership, family follow-up, scheduling, communication history, people, households, sacramental records, baptism certificates, Mass intentions, imports, reports, parish settings, staff access, daily operations briefs, Google Calendar sync, and AI-assisted summaries/reply drafts.

Use the product name "Vinea Platform." The legal entity is "Vinea Technologies LLC." "Parish Operations" is a descriptor, not the main product name.

## Stack

- Next.js 16.3.0 App Router.
- React 19.2.4.
- TypeScript.
- Tailwind CSS 4.
- Supabase Auth and PostgreSQL.
- OpenAI SDK for AI summaries/replies.
- Resend for email.
- Google APIs for Calendar OAuth/sync.
- Vitest for tests.

Important: This repo uses a Next.js version with breaking changes. Before editing Next.js code, read the relevant guide in `node_modules/next/dist/docs/`.

## Current Release Boundary

- Production domain: `https://vineaplatform.com`.
- The base application is technically release-ready under the repository-owned local gate, but production rollout is not currently approved.
- The July 15, 2026 controlled rollout stopped before promotion because an approved production-smoke session or dedicated credentials and fixture selectors were unavailable. Production remained on the approved rollback deployment.
- A future attempt requires a newly approved exact rollout window, available named owners/channels, approved read-only fixture labels, and an authenticated production-smoke session or dedicated `PRODUCTION_SMOKE_*` values by name only.
- Production RLS, monitoring, exports, public-intake routing, AI, reminders, certificate/correction runtime, CSP enforcement, backup/restore claims, and public trust claims remain separately gated.

## Key Routes

Public:

- `/`: marketing landing page.
- `/baptism-request`.
- `/funeral-request`.
- `/wedding-request`.
- `/ocia-request`.
- `/join-parish-request`.
- `/login`.

Protected staff dashboard:

- `/dashboard`.
- `/dashboard/requests/[id]`.
- `/dashboard/intake`.
- `/dashboard/people`.
- `/dashboard/households`.
- `/dashboard/records`.
- `/dashboard/intentions`.
- `/dashboard/reports`.
- `/dashboard/imports`.
- `/dashboard/calendar`.
- `/dashboard/communications`.
- `/dashboard/settings`.
- `/dashboard/onboarding`.
- `/dashboard/admin/audit-log`.

API:

- `POST /api/intake`: public intake submission; service-role writes.
- `POST /api/ai/summary`: staff-only AI summary.
- `POST /api/ai/reply`: staff-only AI reply/follow-up draft.
- `POST /api/email/send`: send email.
- Google Calendar create/update/delete routes.
- Google OAuth start/callback routes.
- `/api/health`.
- `/api/parish/daily-brief`.
- `/api/imports`.
- duplicate review routes for people/households.

## Core Product Rules

Request statuses:

- `new`.
- `in_progress`.
- `waiting_on_family`.
- `complete`.

Waiting-on values:

- `family_response`.
- `priest_availability`.
- `documents`.
- `date_confirmation`.
- `parish_staff_action`.
- `payment_or_stipend`.
- `godparent_paperwork`.
- `marriage_prep_documents`.
- `other`.

Universal workflow order:

1. Assign ownership.
2. Make first contact.
3. Set next follow-up.
4. Address overdue/due-today follow-up.
5. Confirm schedule if the request type requires it.
6. Resolve stale contact.
7. Finish checklist.
8. Resolve waiting-on blocker.
9. Mark ready to complete.

Schedule required for:

- Baptism.
- Funeral.
- Wedding.
- OCIA.

Schedule not currently required for:

- Join parish.

## Workflow Details

Baptism:

- Public route: `/baptism-request`.
- Default checklist: birth certificate, godparent information, prep class completion, baptism date confirmed.
- Schedule field: `requests.confirmed_baptism_date`.
- Record/certificate path: sacramental record and baptism certificate generation.

Funeral:

- Public route: `/funeral-request`.
- Default checklist: first pastoral contact, funeral home coordination, service date/time, death certificate/vital records, readings/music, obituary/program/livestream, cemetery/committal, post-funeral follow-up.
- Schedule field: `funeral_request_details.confirmed_service_at`.
- Tone must be compassionate and non-transactional.

Wedding:

- Public route: `/wedding-request`.
- Default checklist: initial meeting, wedding date confirmed, liturgy details finalized.
- Schedule field: `wedding_request_details.confirmed_ceremony_at`.
- Sacramental record type is `marriage`, not `wedding`.

OCIA:

- Public route: `/ocia-request`.
- Default checklist: initial conversation, inquiry/materials shared, Rite of Acceptance/Welcome as applicable.
- Schedule field: `ocia_request_details.confirmed_session_at`.

Join parish:

- Public route: `/join-parish-request`.
- Default checklist: welcome outreach, registration info, introduce ministries/next steps, connect with OCIA coordinator if interested.

## Database Model

V1 parish scope:

- `primary_parish_id()` returns the oldest row in `parishes`.
- This is not true multi-tenant architecture. Do not treat it as diocesan-scale isolation.

Important tables:

- `parishes`: parish profile/settings.
- `staff_users`: authorized staff by parish/email/role/active flag.
- `parishioners`: intake contact records.
- `requests`: core operational workflow record.
- `checklist_items`: request checklist rows.
- `request_communications`: communication history.
- `request_notes`: staff note entries.
- `funeral_request_details`: funeral-specific request fields.
- `wedding_request_details`: wedding-specific request fields.
- `ocia_request_details`: OCIA-specific request fields.
- `join_parish_request_details`: parish registration-specific fields.
- `people`: parish directory person profiles.
- `households`: household records.
- `household_members`: people-to-household relationships.
- `sacramental_records`: parish sacramental register.
- `sacramental_record_events`: append-only sacramental record audit events.
- `mass_intentions`: Mass intention tracking.
- `parish_google_integrations`: service-role-only Google OAuth/calendar binding.
- `audit_events`: append-only operations audit trail.
- `import_batches`: staff-visible import history.

Sacramental record types:

- `baptism`.
- `marriage`.
- `funeral`.
- `confirmation`.
- `first_communion`.
- `ocia`.
- `rcic`.

## Security Model

Authentication:

- Supabase Auth email/password.
- Next.js 16 `proxy.ts` protects `/dashboard/:path*`.

Authorization:

- Staff access requires `STAFF_ALLOWLIST_EMAILS`, active `staff_users`, or dev fallback when not production and no allowlist exists.
- Use `requireStaffFromRequest` or `authorizeStaffUser` for protected route handlers.

RLS:

- Most parish tables require `is_authorized_staff()` plus `primary_parish_id()` scope.
- Public intake does not rely on direct anonymous writes. Do not re-enable direct anon RLS policies.

Service role:

- Use only server-side.
- Required for `/api/intake`, privileged admin reads/writes, and Google integration secrets.

Secrets:

- Never expose env values in logs, UI, docs, or API responses.
- Health checks return missing env names only.

Known limitations:

- In-memory rate limiting is basic and per instance.
- V1 single-parish scoping must be redesigned for multi-parish tenancy.
- Google refresh token handling needs production operational policy.

## AI Features

AI routes use OpenAI Responses API with model `gpt-5-mini`.

AI summary:

- Internal staff summary.
- Tailored for baptism, funeral, wedding, and OCIA.

AI reply:

- Drafts initial or follow-up pastoral emails.
- Staff must review and decide what to send.

Do not:

- Send AI-generated email automatically.
- Present AI output as authoritative record data.
- Remove staff review from communication workflows.

## Environment Variables

Core:

- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY`.
- `NEXT_PUBLIC_APP_URL`.

AI:

- `OPENAI_API_KEY`.

Email:

- `RESEND_API_KEY`.
- `RESEND_FROM_EMAIL`.
- `DEMO_REQUEST_TO_EMAIL`.
- `REQUEST_NOTIFICATION_TO_EMAIL`.
- `VINEA_EMAIL_LOGO_URL`.

Google:

- `GOOGLE_CLIENT_ID`.
- `GOOGLE_CLIENT_SECRET`.
- `GOOGLE_OAUTH_STATE_SECRET`.

Auth/staff:

- `STAFF_ALLOWLIST_EMAILS`.

Cron:

- `CRON_SECRET`.

Demo:

- `NEXT_PUBLIC_DEMO_SITE`.

## Development Commands

Install:

```bash
npm install
```

Dev server:

```bash
npm run dev
```

Build:

```bash
npm.cmd run build
```

Tests:

```bash
npm.cmd test
```

Lint:

```bash
npm.cmd run lint
```

Production readiness docs recommend running build, tests, and lint before handoff.

## Code Navigation

Workflow logic:

- `lib/requestWorkflowV2.ts`.
- `lib/requestWorkflowChecklist.ts`.
- `lib/workflowPlaybooks.ts`.
- `lib/requestReadyToComplete.ts`.
- `lib/requestWaitingOn.ts`.

Intake:

- `app/api/intake/route.ts`.
- Public form pages under `app/*-request/page.tsx`.

Auth/security:

- `proxy.ts`.
- `lib/server/requireStaff.ts`.
- `lib/staffAuthorization.ts`.
- `lib/supabase.ts` for the lazy browser anon client.
- `lib/supabase/server.ts` and `lib/supabase/routeHandlerClient.ts` for server/session clients.
- `lib/supabaseServiceServer.ts`.
- `supabase/migrations/*staff*`.

Database migrations:

- `supabase/migrations`.


People/households/records/imports:

- `lib/people.ts`.
- `lib/households.ts`.
- `lib/sacramentalRecords.ts`.
- `lib/parishDataImport.ts`.

Email/AI/calendar:

- `lib/openai.ts`.
- `lib/email/*`.
- `lib/parishGoogleCalendarServer.ts`.
- `app/api/google/*`.

## Do Not Change Without Explicit Direction

- Do not bypass staff authorization on dashboard or sensitive APIs.
- Do not expose service role or OAuth secrets.
- Do not reintroduce direct anonymous writes for intake.
- Do not make multi-parish claims while `primary_parish_id()` drives scope.
- Do not change AI to send directly without staff approval.
- Do not use `wedding` as sacramental record type; use `marriage`.
- Do not remove append-only behavior from sacramental record events.

## Needs Verification

- Next controlled production rollout window and approved smoke access.
- Support/sales/billing contacts.
- Pricing and packaging.
- Formal brand colors.
- Backup/restore SLA.
- Multi-parish roadmap.
- Certificate generation roadmap beyond baptism.
- Role model beyond admin/staff.
