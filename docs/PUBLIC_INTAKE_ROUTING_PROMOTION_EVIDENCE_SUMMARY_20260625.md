# Public Intake Routing Promotion Evidence Summary - 2026-06-25

Status: Promotion approved for schema-only migration. Runtime intake routing remains unwired.

This summary connects the completed disposable QA evidence to the promoted schema-only migration. It does not wire runtime public intake routing or change operational RLS.

## Evidence Reviewed

- Disposable reusable project cleanup evidence: `docs/DISPOSABLE_REUSABLE_PROJECT_CLEANUP_EXECUTION_EVIDENCE_20260625.md`
- Disposable base schema bootstrap replay evidence: `docs/DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260625_REUSABLE_COMPLETED.md`
- Disposable app public intake QA evidence: `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260625_COMPLETED.md`
- Forward migration candidate: `docs/sql/public_intake_parish_routing_migration_candidate.sql`
- Promoted migration: `supabase/migrations/20260625193000_public_intake_parish_routing.sql`
- Rollback draft: `docs/sql/public_intake_parish_routing_rollback_draft.sql`
- Promotion checklist: `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`

## Completed Evidence Gates

- Approved reusable disposable project `kikqtorplsswepqitjys` was reset with the guarded disposable-only cleanup script.
- The disposable base schema bootstrap candidate was applied after cleanup.
- All repo Supabase migrations applied in sorted order against the disposable target.
- Schema verification found `0` missing required tables and `0` missing required functions.
- A disposable local app instance returned `/api/health` HTTP `200`.
- `/api/health` reported `checks.schema: true`.
- Public intake page availability passed for Baptism, Wedding, Funeral, OCIA, and Join Parish.
- Public intake submission regression passed for Baptism, Wedding, Funeral, OCIA, and Join Parish.
- Normal public intake rate-limit behavior accepted submissions before the threshold.
- Durable public intake `429` behavior triggered after the threshold and included a `Retry-After` header.
- Evidence files record that production, shared QA, runtime public intake wiring, and operational RLS were not changed during disposable QA.
- Secret scans during the evidence runs found no recorded database password, anon key, service role key, or full connection string in repo evidence.

## Promotion Status

Decision: `Promote Schema Only`

The disposable evidence package and product-owner approval support promoting the schema-only migration into `supabase/migrations`. Runtime public intake routing is still not product-approved for application in this phase.

## Remaining Gates Before Runtime Routing

- Apply the promoted migration to the intended QA database and confirm `/api/health` returns `checks.schema: true`.
- Confirmation that runtime intake resolver wiring will be shipped separately from schema promotion unless explicitly approved otherwise.
- Manual staff workflow QA plan for the first non-production target after promotion.
- Security/data sign-off that no anonymous direct management access, staff-only data, internal notes, AI notes, audit logs, token hashes, or private parish data are exposed.

## No-Go Conditions Still In Force

- Do not apply the candidate to production directly from `docs/sql`.
- Do not bundle runtime public intake routing, route wiring, or operational RLS changes into the schema-promotion commit.
- Do not proceed to runtime routing if rollback ownership or rollback evidence is missing.

## What Changed Plain English

The disposable test evidence is now gathered into one short promotion summary. It says what has been proven, what has been approved for schema-only promotion, and why Vinea should still not change live public intake routing behavior yet. This helps prevent a future developer from mistaking a database foundation for a live public routing feature.
