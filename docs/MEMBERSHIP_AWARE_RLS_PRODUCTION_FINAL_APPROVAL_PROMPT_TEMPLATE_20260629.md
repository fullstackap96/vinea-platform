# Membership-Aware Operational RLS Production Final Approval Prompt Template - 2026-06-29

Status: Final approval prompt template prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this template.

## Purpose

Use this template only after the product owner is ready to give a separate explicit production approval for the membership-aware operational RLS rollout.

This document does not approve production work. It provides the exact approval language the product owner would paste later, after confirming the production target, release label, rollout window, rollback owner, monitoring owner, and excluded scopes.

## Source Readiness Inputs

- Filled human intake checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md`
- Filled-checklist validation gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md`
- Rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Final go/no-go checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md`

## Current Readiness Result

Current decision: `TEMPLATE_READY_APPROVAL_NOT_GIVEN`

The filled intake checklist and validation gate are ready for a final approval discussion:

- Owners complete: `YES`
- Fixtures complete and safe as planning labels: `YES`
- Rollout and rollback complete as planning labels: `YES`
- Scope guard complete: `YES`
- Separate product-owner production approval still required: `YES`

## Required Production Target Placeholders

Before using the approval prompt, replace these placeholders with safe, non-secret production target labels.

Do not paste database connection strings, passwords, service-role keys, anon keys, OAuth secrets, raw family portal tokens, signed URLs, private document contents, or private parish data.

| Placeholder | What to enter | Safe example |
|---|---|---:|
| `<PRODUCTION_APP_HOST>` | Production Vinea app host only, no credentials | `https://app.example.com` |
| `<PRODUCTION_DATABASE_HOST>` | Production database host only, no connection string | `db.project-ref.supabase.co` |
| `<PRODUCTION_RELEASE_LABEL>` | Git commit, release tag, or deployment label intended for production | `release-YYYY-MM-DD-membership-rls` |
| `<PRODUCTION_ROLLOUT_WINDOW>` | Confirmed rollout window | `2026-07-01 8:00-8:30 PM Central` |
| `<ROLLBACK_DECISION_DEADLINE>` | Latest rollback decision time | `2026-07-01 8:20 PM Central` |
| `<ROLLBACK_OWNER>` | Named rollback owner | `Alex Perez - Rollback Owner` |
| `<MONITORING_OWNER_AND_CHANNEL>` | Named monitoring owner and safe channel/tool label | `Alex Perez - Local Codex session and Vercel/Supabase dashboards` |
| `<EVIDENCE_STORAGE_LOCATION>` | Safe evidence storage label only | `Vinea Production RLS Evidence Folder - restricted` |

## Values From The Filled Intake Checklist

These values are already filled in `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md` and can be reused in the final prompt if they remain accurate at rollout time:

- Product owner: `Alex Perez - Product Owner`
- Technical owner: `Alex Perez - Technical Owner`
- QA owner: `Alex Perez - QA Owner`
- Security/data owner: `Alex Perez - Security/Data Owner`
- Rollback owner: `Alex Perez - Rollback Owner - available during rollout window`
- Monitoring owner/channel: `Alex Perez - Monitoring Owner`; `Local Codex session and Vercel/Supabase dashboards`
- Support owner/escalation path: `Alex Perez - Support Owner`; `Alex Perez reviews issues and pauses rollout if needed`
- Evidence storage owner/location: `Alex Perez - Evidence Owner`; `Vinea Production RLS Evidence Folder - restricted`
- Planned rollout window: `2026-07-01 8:00-8:30 PM Central`
- Planned rollback decision deadline: `2026-07-01 8:20 PM Central`

## Excluded Scopes

The approval prompt must confirm these are out of scope unless separately approved:

- Runtime public intake routing.
- Public intake runtime routing production flags.
- AI production flag enablement.
- Google Calendar data mutation.
- Staff membership data cleanup.
- Operational table schema redesign.
- Production data cleanup.
- Pricing, billing, marketing, or customer communication changes.
- Any unrelated deployment or feature rollout.

## Exact Approval Language To Provide Later

Do not paste this prompt until the product owner is intentionally approving production work.

```text
APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT

I explicitly approve the production membership-aware operational RLS rollout for Vinea.

Production target app host, without credentials: <PRODUCTION_APP_HOST>
Production target database host, without connection string: <PRODUCTION_DATABASE_HOST>
Production-intended commit/release/deployment label: <PRODUCTION_RELEASE_LABEL>

Approved rollout window: <PRODUCTION_ROLLOUT_WINDOW>
Rollback decision deadline: <ROLLBACK_DECISION_DEADLINE>
Rollback owner: <ROLLBACK_OWNER>
Monitoring owner/channel: <MONITORING_OWNER_AND_CHANNEL>
Evidence storage location: <EVIDENCE_STORAGE_LOCATION>

I confirm that docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md is filled with safe, non-secret values.
I confirm that docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md has decision GO_READY_FOR_PRODUCT_OWNER_APPROVAL.
I confirm that production-safe smoke fixtures are labels only until verified during the rollout window.
I confirm that rollback instructions and rollback ownership are ready.
I confirm that monitoring will watch /api/health, staff auth, request detail, documents, direct storage privacy, family portal safety, and RLS/policy errors during and after the rollout.

I confirm the following are out of scope unless separately approved:
- Runtime public intake routing.
- Public intake production runtime flags.
- AI production flag enablement.
- Google Calendar data mutation.
- Staff membership data cleanup.
- Operational table schema redesign.
- Production data cleanup.
- Pricing, billing, marketing, or customer communication changes.
- Any unrelated deployment or feature rollout.

Final readiness decision: GO
```

## Operator Guardrails After Approval

After the exact approval prompt is provided later, the operator should still:

1. Re-read `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`.
2. Confirm the production target host values are labels only and contain no secrets.
3. Confirm no unrelated production deployment is in progress.
4. Run automated checks on the production-intended commit.
5. Capture pre-apply `/api/health`.
6. Apply only `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`.
7. Run the documented post-apply smoke checks.
8. Rehearse or execute rollback only under the documented rollback decision criteria.
9. Store redacted evidence in the approved evidence location.

## Hard Stops

Do not proceed from approval template to production execution if any of these are true:

- `<PRODUCTION_APP_HOST>` is missing or is not HTTPS.
- `<PRODUCTION_DATABASE_HOST>` is missing or includes a connection string.
- `<PRODUCTION_RELEASE_LABEL>` is missing.
- Rollback owner, monitoring owner/channel, or evidence storage location is missing.
- Production-safe smoke fixtures have not been verified.
- Any secret, password, token, signed URL, private document content, private parish data, raw family portal token, token hash, service-role key, or database URL appears in the approval prompt.
- Public intake runtime routing, AI production flags, Google Calendar mutation, staff membership cleanup, or production data cleanup is bundled into the same approval.

## What Changed Plain English

This template gives the exact words to use later if you decide to approve the production RLS rollout. It keeps the approval clear, narrow, and safe: it names the target placeholders, the rollout window, the rollback owner, the monitoring owner, and what is not included. It still does not approve production by itself.
