# Vinea Technical Report

Generated: 2026-07-02
Full report: `docs/VINEA_ENGINEERING_PRODUCT_STATE_REPORT_20260702.md`

## Architecture

Vinea is a Next.js 16.2.2 App Router application using React 19.2.4, TypeScript, Tailwind CSS 4, Supabase Auth/Postgres/Storage, OpenAI, Resend, Google Calendar, Vercel cron, and Vitest.

Backend behavior is implemented through Next.js route handlers, server actions, and server-only helpers in `lib/server`. The database is managed through SQL migrations in `supabase/migrations`, with risky candidates and rollback drafts staged under `docs/sql`.

## Security Posture

Implemented:

- Supabase Auth for staff login.
- `proxy.ts` protects `/dashboard/:path*`.
- Staff authorization via allowlist, `staff_users`, and membership helpers.
- RLS on key parish tables.
- Public intake mediated by `/api/intake` service-role route.
- Direct anonymous table writes removed.
- Durable public-intake rate limiting.
- Active parish context helpers and selected-parish route migrations.
- Hashed family portal tokens.
- Service-role-only Google integration secrets.
- Export runtime gates and audit reviewer prototypes.
- AI safety registry and runtime summary gate scaffolding.

Gaps:

- Operational RLS promotion is not complete.
- MFA/SSO and granular RBAC are absent.
- Retention/deletion policies are not product-enforced.
- Production export and backup/restore claims remain gated.
- AI safety contracts are not fully wired into all generation paths.

## Main Technical Risks

1. V1 `primary_parish_id()` compatibility fallback must not be mistaken for multi-tenant isolation.
2. Lack of queue/background-job system will strain email, AI, document processing, and automation.
3. Search/reporting may need read models or indexing before diocesan scale.
4. Documentation/evidence volume needs consolidation.
5. Checklist and workflow-step models overlap.
6. Production observability is not yet explicit.

## Next Engineering Priorities

- Run disposable membership-aware operational RLS forward/rollback QA.
- Promote operational RLS only after every evidence gate passes.
- Add production monitoring and incident alerting.
- Wire AI source display, audit metadata, and staff disposition into runtime.
- Add MFA/SSO/RBAC plan.
- Create a docs/evidence index for maintainability.
- Introduce a queue strategy before workflow automation grows.
