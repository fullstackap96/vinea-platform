# Public Intake Parish Routing Strategy

Status: Strategy implemented through schema promotion and safe QA route wiring. Do not enable runtime public intake routing in production or change operational RLS from this document.

Related files:

- `app/api/intake/route.ts`
- `lib/server/publicIntakeParishScope.ts`
- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`
- `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`
- `docs/MULTI_PARISH_REMAINING_PATHS_INVENTORY.md`

## Purpose

Public intake is currently safe for single-parish deployments and now has disabled-by-default route wiring for safe QA. Public intake must identify the intended parish before it creates a parishioner, request, workflow steps, audit event, or document requirement whenever runtime routing is enabled.

Public intake must not use staff active parish cookies. Staff cookies represent an authenticated staff session, while public forms are submitted by families, funeral homes, couples, catechumens, sponsors, and other unauthenticated visitors.

## Current Runtime Behavior

- `app/api/intake/route.ts` accepts public Baptism, Funeral, Wedding, OCIA, and Join Parish submissions.
- With runtime flags off, the route uses a service-role client and assigns submissions to the oldest parish row through the legacy adapter path.
- With the exact safe QA runtime flags on, the route can resolve parish scope by token, verified domain, slug, or legacy public form path.
- The old unused `lib/intakeParishScope.ts` helper was removed on 2026-07-08; current legacy scoping lives only in the intentional `/api/intake` compatibility loader and `lib/server/publicIntakeParishScope.ts` adapter path.
- Production behavior must remain legacy until a separate production enablement approval is granted.

## Routing Options

### Option 1: Parish Slug

Example routes:

- `/intake/st-ann/baptism`
- `/intake/st-ann/funeral`
- `/p/st-ann/wedding`

Recommended role: primary strategy.

Strengths:

- Easy to place on parish websites.
- Easy for parish staff to understand.
- Works without custom DNS setup.
- Can be tested before domain routing or tokens exist.

Requirements:

- Each public slug must be globally unique.
- Slugs must be lower-case, stable, and URL-safe.
- A parish must be active and `public_intake_enabled = true` before a slug can receive submissions.
- Missing, disabled, or unknown slugs should return a generic not-found response to reduce parish enumeration.

### Option 2: Domain Or Host Mapping

Example hostnames:

- `stann.vinea.app`
- `intake.stannparish.org`

Recommended role: build later after slug routing is working.

Strengths:

- Best parishioner experience for mature deployments.
- Supports parish clusters and diocesan branded intake.
- Allows QR codes and website links to feel parish-specific.

Requirements:

- Store verified hostnames separately from parish rows.
- Require verification before a hostname routes public submissions.
- Normalize hostnames to lower-case.
- Treat unverified or inactive hostnames as missing routes.

### Option 3: Signed Public Form Token

Example usage:

- Email link for a specific family.
- QR code for a parish registration event.
- Private funeral-home intake link.

Recommended role: build after slug routing; useful for campaigns and private forms.

Requirements:

- Store only a token hash, never the raw token.
- Show raw tokens only once at creation time.
- Tokens must identify parish, request type, label, active status, and optional expiration.
- Tokens must not encode staff identity or grant staff access.
- Tokens should be revocable without changing parish slug routing.

## Recommended Precedence

Future helper name: `resolvePublicIntakeParishScope`.

Current implementation status:

- `lib/server/publicIntakeParishScope.ts` contains the resolver helper.
- The helper is covered by unit tests and wired into `/api/intake` behind disabled-by-default runtime flags.
- The helper is not wired into public pages.
- The helper ignores staff active parish cookies by design.

Resolution order:

1. Signed public token, when present and valid.
2. Verified domain or host mapping.
3. Parish slug route.
4. Legacy fallback only for existing legacy URLs.

Legacy fallback should remain limited to current public routes such as `/baptism-request`, `/funeral-request`, `/wedding-request`, `/ocia-request`, and `/join-parish`. New multi-parish public routes should fail closed when a parish cannot be resolved.

## Data Model Plan

### `parishes` additions

- `public_slug text`
- `public_display_name text`
- `public_intake_enabled boolean not null default false`

Slug rules:

- Unique by lower-case value when present.
- Lower-case letters, numbers, and hyphens only.
- Length between 3 and 80 characters.
- No broad public table access should be added.

### `parish_public_intake_domains`

Purpose: map verified public hostnames to parishes.

Fields:

- `id uuid primary key`
- `parish_id uuid not null references public.parishes(id) on delete cascade`
- `hostname text not null`
- `verified_at timestamptz`
- `active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- Unique lower-case hostname.
- Hostname must be normalized before insert.

### `parish_public_intake_tokens`

Purpose: route private or campaign-specific intake links without exposing internal parish identifiers.

Fields:

- `id uuid primary key`
- `parish_id uuid not null references public.parishes(id) on delete cascade`
- `token_hash text not null`
- `label text not null`
- `request_type text`
- `expires_at timestamptz`
- `active boolean not null default true`
- `last_used_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- Unique token hash.
- Request type must be one of `baptism`, `funeral`, `wedding`, `ocia`, `join_parish`, or null for all supported forms.

## Security Considerations

- Do not use staff active parish cookies for public intake.
- Resolve public parish scope server-side only.
- Keep service-role writes behind controlled API routes.
- Do not add broad anonymous RLS policies for public direct table writes.
- Require active parish status and `public_intake_enabled = true` before accepting public submissions.
- Keep durable public intake rate limiting before database writes.
- Use generic errors for invalid slugs, disabled parishes, unverified hostnames, expired tokens, and inactive tokens.
- Never return internal parish IDs, staff data, private settings, audit logs, AI notes, internal notes, or membership data in public responses.
- Store token hashes only; raw token values should be generated server-side and shown once.
- Add audit metadata for routing source, such as `slug`, `domain`, `token`, or `legacy_fallback`, without storing raw token values.
- Add explicit tests that a forged staff active parish cookie has no effect on public intake routing.

## Non-Applied Migration Plan

The non-applied migration candidate lives at:

- `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- `docs/sql/public_intake_parish_routing_rollback_draft.sql`
- `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`

Do not move this file into `supabase/migrations` until these gates pass:

- Disposable QA database applies the candidate cleanly.
- Rollback is prepared and tested.
- Slug backfill and uniqueness have been reviewed.
- Staff settings UI impact has been reviewed.
- Public form QA covers every request type.
- Durable public intake rate limiting still returns expected normal and 429 behavior.
- `/api/health` schema checks are updated only after the migration becomes applied runtime schema.

Disposable QA validation, rollback steps, resolver test cases, and approval gates are documented in `docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md`.

Future `/api/health` schema-readiness criteria are documented in `docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md`.

Disposable QA run evidence should be captured with `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`.

Disposable SQL execution order and verification queries are documented in `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`.

Promotion from `docs/sql` into `supabase/migrations` must follow `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`.

## Future API Plan

Future helper contract:

```ts
type PublicIntakeParishScope = {
  ok: true
  parishId: string
  routeSource: 'token' | 'domain' | 'slug' | 'legacy_fallback'
  publicDisplayName: string | null
  requestType: 'baptism' | 'funeral' | 'wedding' | 'ocia' | 'join_parish' | null
} | {
  ok: false
  status: 404 | 410 | 429
  error: string
}
```

Future API behavior:

- `POST /api/intake` may accept `parishSlug` or `publicToken` only after the resolver exists.
- Slug-aware pages should pass the resolved parish routing signal to `/api/intake`.
- Domain-aware pages should rely on request host validation.
- Legacy public form pages should keep existing behavior until every production customer has migrated to explicit parish links.

## Acceptance Criteria For Future Runtime Implementation

- Legacy public intake still works for single-parish deployments.
- Slug routes create requests under the slug's parish.
- Disabled slugs do not create requests.
- Unknown slugs do not reveal whether a parish exists.
- Verified domains route to the correct parish.
- Unverified domains fail closed.
- Valid tokens route to the correct parish and optional request type.
- Expired or inactive tokens fail closed.
- Staff active parish cookies do not affect public intake.
- Audit events include safe routing metadata.
- Workflow template instantiation uses the resolved parish's request type template.
- Public responses expose only safe family-facing information.
