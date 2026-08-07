# Controlled Production Rollout Checkpoint

Current decision state: `MAIN MERGED; PRODUCTION ROUTING RESTORED; INTAKE READY; EXPLICIT ROLLOUT APPROVAL STILL NO-GO`

Date prepared: 2026-07-12

## Purpose

This checkpoint binds Vinea's merged release identity to the exact evidence, owners, fixtures, smoke gates, monitoring, and rollback controls required before a future production rollout decision.

It does not approve production deployment, production access, production smoke, production migrations, operational RLS changes, production monitoring, exports, public-intake runtime routing, customer-facing AI, CSP runtime, public trust claims, or any production-sensitive feature flag.

## Current Control-Plane Record

| Item | Verified state |
| --- | --- |
| Merged `main` commit | `f134b598308ddd78b5b6b81ee447bf5b1fb15937` |
| Merge method | Exact-SHA, non-force fast-forward from `codex/release-candidate-20260711` |
| Remote comparison after merge | `main` and the approved SHA were identical |
| Required release checks before merge | GitHub Actions passed; Vercel Preview status passed |
| Protected Preview evidence | `docs/RELEASE_CANDIDATE_PROTECTED_PREVIEW_SMOKE_20260712.md` |
| Automatic Vercel production deployment | `dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG` at the merged SHA; reached `READY` before cancellation could complete |
| Production application/data access during correction | `NONE` |
| Restored production deployment | `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW` |
| Restored deployment commit | `c52d947b0f70ad01c8dc6920ad49979ca17d25d2` |
| Restored deployment URL label | `vinea-platform-oru4kih31-vinea.vercel.app` |
| Rollback status | Vercel control plane reported `Success` |
| Primary alias verification | `vineaplatform.com` mapped to `vinea-platform-oru4kih31-vinea.vercel.app` |

The initially named rollback target `dpl_Dcd6EBKjC6dshVZHrmrwiMtM7SKy` was a non-production redeploy of the same prior `main` commit and had never served production traffic. Vercel correctly rejected it as ineligible. The restored deployment above is the production-served counterpart of that same commit.

## Release Candidate Evidence

Review these artifacts before any rollout approval:

1. `docs/RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711.md`
2. `docs/RELEASE_CANDIDATE_COMMIT_SCOPE_REVIEW_20260711.md`
3. `docs/RELEASE_CANDIDATE_TECHNICAL_APPROVAL_20260711.md`
4. `docs/RELEASE_CANDIDATE_PROTECTED_PREVIEW_SMOKE_20260712.md`
5. `docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md`
6. `docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md`
7. `docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md`

The final local release gate passed all 15 checks, including repository secret scanning, dependency audit, release evidence gates, both TypeScript scopes, lint, 832 test files / 3,546 tests, and the credential-free 56-page Next.js build. The matching protected Preview passed health, staff sign-in, active-parish switching, Onboarding, Imports, duplicate review, Communications Center, and browser-console review without writes.

## Required Named Owners

The confirmed labels are recorded in `docs/CONTROLLED_PRODUCTION_ROLLOUT_HUMAN_INTAKE_20260714.md` and validated by `node scripts/check-controlled-production-rollout-intake.mjs`. The checker returns `READY_FOR_EXPLICIT_APPROVAL`; this readiness result does not grant production approval. The exact separate prompt is prepared in `docs/CONTROLLED_PRODUCTION_ROLLOUT_FINAL_APPROVAL_PROMPT_20260714.md` and must be intentionally supplied in a later product-owner instruction before any production action.

The future approval record must provide non-secret labels for each role:

| Role | Required responsibility |
| --- | --- |
| Product owner | Approves the exact rollout scope, window, and customer-facing boundary. |
| Engineering rollout owner | Confirms the immutable SHA and performs only the approved Vercel promotion. |
| Security/data owner | Confirms no migration, RLS, export, AI, routing, monitoring, or trust-claim scope is bundled into the base rollout. |
| QA owner | Owns production-safe fixture selection and the smoke record. |
| Monitoring owner/channel | Watches Vercel control-plane/runtime indicators and owns stop escalation. |
| Support owner/channel | Handles staff-visible regressions without sending proactive customer communication unless separately approved. |
| Rollback owner | Can immediately restore `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW`. |
| Evidence owner | Stores the sanitized rollout record without secrets, raw IDs from customer records, tokens, or private content. |

## Production-Safe Fixture Requirements

Before approval, record labels only for:

- one staff account permitted for production smoke
- one authorized active parish and one authorized parish-switch target
- one same-parish request safe for read-only detail verification
- one cross-parish or unauthorized request denial fixture
- one Onboarding view fixture
- one Imports read-only history fixture; no import upload or commit
- People and Household duplicate-review pages; no discovery or merge
- Communications Center read-only fixture; no touchpoint, follow-up, email, or SMS mutation
- one family-portal denial fixture only if separately approved for the rollout smoke
- monitoring, support, rollback, and evidence-storage labels

Do not put credentials, token material, raw production record identifiers, private document details, parishioner contact data, or customer content in this checkpoint or its evidence.

## Pre-Rollout Gates

Every item must be `PASS` before promotion:

1. `main` still resolves to `f134b598308ddd78b5b6b81ee447bf5b1fb15937`.
2. GitHub Actions and the release-candidate Vercel Preview remain green for that SHA.
3. The rollout window includes an exact date, start time, end time, and timezone.
4. Every required owner is named and available for the complete window plus rollback observation.
5. Production-safe fixture labels are selected and approved.
6. Vercel production environment readiness is checked by variable name and scope only; values are never printed.
7. Production schema compatibility and `/api/health` access are explicitly approved for the smoke window. No migration is implied.
8. Production-sensitive flags are confirmed disabled by name/scope only.
9. The rollback target remains `READY` and eligible.
10. Support and monitoring channels are open before promotion.

## Controlled Rollout Procedure

Only after a separate exact approval:

1. Reconfirm the candidate deployment is `dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG` and its commit is the approved merged SHA.
2. Reconfirm the rollback deployment is `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW`.
3. Promote the existing candidate through Vercel control plane. Do not rebuild, apply migrations, or change flags as part of promotion.
4. Confirm production aliases point to the approved candidate.
5. Run only the separately approved production-safe smoke checklist.
6. Record label-only pass/fail evidence and monitoring observations.
7. End the window with an explicit `KEEP` or `ROLLBACK` decision.

## Production-Safe Smoke Boundary

The future smoke may include only explicitly approved checks:

- `/api/health` returns HTTP 200 with `checks.schema: true`
- safe staff sign-in
- selected active-parish switching between authorized parishes
- read-only Onboarding, Imports, People duplicate review, Household duplicate review, and Communications Center views
- same-parish request detail read and generic cross-parish denial
- browser console review for errors and blocked core resources

The smoke must not send communications, upload or merge records, apply imports, create documents or signed URLs, call Google Calendar, call AI, run exports, generate certificates, mutate sacramental records, change settings, enable routing, or use real family portal token material.

## Stop And Rollback Criteria

Rollback immediately if any of these occur:

- `/api/health` is not healthy within the approved observation window
- staff authentication or active-parish switching fails
- same-parish reads fail or cross-parish data becomes visible
- production schema incompatibility appears
- sustained server errors or severe client errors appear
- any production-sensitive capability is unexpectedly enabled
- monitoring, support, or rollback ownership becomes unavailable
- evidence cannot be captured without exposing private data or secrets

Rollback uses the Vercel control plane to restore `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW`. Do not change database state, migrations, RLS, flags, integrations, or customer records as part of rollback. Verify only rollback status and alias metadata unless application smoke is separately approved.

## Separately Locked Production Gates

This base application checkpoint does not approve:

- membership-aware operational RLS production rollout
- production monitoring runtime
- request-list or document-manifest production exports
- export audit reviewer production exposure
- public-intake runtime routing
- AI summary or reply production runtime
- CSP report-only or enforcing CSP runtime
- workflow reminder delivery
- certificate issuance logging runtime
- sacramental correction or notation runtime
- public backup/restore, compliance, security, or trust-center claims

Each remains governed by `docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md` and its capability-specific evidence package.

## Exact Future Approval Language

The fully substituted, mechanically validated version is now prepared in `docs/CONTROLLED_PRODUCTION_ROLLOUT_FINAL_APPROVAL_PROMPT_20260714.md`. The template below remains historical checkpoint context only; use the prepared prompt for any future decision.

```text
Approve the controlled Vinea base application production rollout at exact main commit f134b598308ddd78b5b6b81ee447bf5b1fb15937 during [EXACT DATE, START TIME, END TIME, TIMEZONE]. Promote only existing Vercel deployment dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG, with dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW as the approved rollback target. The named product, engineering, security/data, QA, monitoring, support, rollback, and evidence owners are available, and the production-safe fixture labels are complete. Run only the smoke checks approved in docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260712.md. Do not apply migrations, change operational RLS, enable production-sensitive flags, send communications, run imports or merges, access storage or signed URLs, call Google Calendar or AI, run exports, generate certificates, mutate records, or make public trust claims. Roll back immediately if a documented stop criterion occurs.
```

Until the fully substituted exact language in `docs/CONTROLLED_PRODUCTION_ROLLOUT_FINAL_APPROVAL_PROMPT_20260714.md` is intentionally supplied in a new product-owner instruction, the decision remains `NO-GO`.

The human intake worksheet is the required source for those replacements. The confirmed intake and prepared exact prompt grant no production approval. Do not infer approval from document existence, owner availability, production-safe fixtures, or the rollout window.
