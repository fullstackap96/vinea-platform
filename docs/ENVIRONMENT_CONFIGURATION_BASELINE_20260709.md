# Environment Configuration Baseline

Status: Implemented as a non-secret repository contract. This baseline does not configure a deployment, enable a feature gate, or approve production use.

## Purpose

Vinea keeps real environment values outside the repository. The committed `.env.example` lists the names an operator may need while leaving credentials blank. It gives local development, CI review, and deployment preparation one safe starting point without copying values from another environment.

## Core Variables

The running application and `/api/health` core checks require:

- `NEXT_PUBLIC_SUPABASE_URL` or the server-side fallback `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`NEXT_PUBLIC_APP_URL` is required for deployment-origin-sensitive flows such as OAuth callbacks and should be the exact approved origin for the target environment.

## Optional Capability Variables

Configure these only when the corresponding capability is approved for that environment:

- Staff and scheduled access: `STAFF_ALLOWLIST_EMAILS`, `CRON_SECRET`
- Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `DEMO_REQUEST_TO_EMAIL`, `REQUEST_NOTIFICATION_TO_EMAIL`, `VINEA_EMAIL_LOGO_URL`
- Google Calendar OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_STATE_SECRET`
- Staff-reviewed AI assistance: `OPENAI_API_KEY`
- Demo presentation banner: `NEXT_PUBLIC_DEMO_SITE=1` only in an approved demo environment

## Safety Rules

1. Never commit `.env.local`, provider exports, database URLs containing passwords, JWTs, private keys, OAuth tokens, API keys, or staff passwords.
2. Store real values in the approved deployment secret store or a local ignored file.
3. Use separate credentials for disposable, shared-QA, staging, and production targets.
4. Keep production-sensitive runtime gates absent from `.env.example`; their approval packets remain the source of truth.
5. Validate `/api/health` after configuring a target. A passing local build does not prove target credentials or schema readiness.
6. Run `npm run check:repository-secrets` before review.
7. Vercel builds fail closed in `next.config.ts` when any core Supabase requirement is missing. This preflight reports names only and does not replace the target `/api/health` smoke.

See `docs/VERCEL_CORE_ENV_BUILD_PREFLIGHT_20260712.md` for the guard contract and its non-production/production boundaries.

## Production Boundary

- Production environment configured by this document: `NO`
- Production-sensitive feature gates enabled: `NO`
- Production deployment approved: `NO`
- Public trust claims approved: `NO`
