# Membership-Aware Operational RLS Production Pre-Approval Dry-Run Checklist - 2026-06-29

Status: Pre-approval dry-run checklist prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this checklist.

## Purpose

Use this checklist to rehearse the future production RLS approval packet before any production approval is requested.

This checklist walks through `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md` step by step. It does not approve production work. It does not verify production fixtures. It does not apply migrations. It only confirms that the evidence package is internally complete enough to ask for a separate explicit product-owner approval later.

## Current Decision

Current decision: `PRE_APPROVAL_DRY_RUN_CHECKLIST_READY_PRODUCTION_NOT_APPROVED`

Production RLS remains `NO-GO` until a separate future prompt explicitly provides the exact approval phrase `APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT`, safe production target labels, a production rollout window, and final go/no-go confirmation.

## Safety Boundaries

Do not use this dry run to access production, apply migrations, change runtime behavior, change operational RLS, touch Google Calendar data, mutate records, or expose secrets.

Do not paste passwords, database URLs, service-role keys, anon keys, OAuth secrets, access tokens, refresh tokens, authorization codes, OpenAI keys, raw family portal tokens, token hashes, signed document URLs, private document contents, internal note bodies, AI prompts, AI outputs, audit payload details, parishioner names, family names, phone numbers, emails, addresses, funeral details, pastoral details, canonical details, or real private documents.

Allowed dry-run evidence:

- Document names and line-free references.
- Safe owner labels.
- Safe fixture labels.
- `PENDING` placeholders.
- `PASS`, `FAIL`, or `BLOCKED` dry-run decisions.
- Non-secret notes such as "approval prompt still missing production host label."

## Dry-Run Operator Instructions

1. Open only repository docs.
2. Do not open the production app.
3. Do not open Supabase production.
4. Do not run SQL.
5. Do not create, edit, upload, approve, reject, delete, or deactivate any records.
6. Do not submit Google Calendar OAuth, create events, update events, or delete events.
7. Mark each row below as `PASS`, `FAIL`, or `BLOCKED`.
8. Stop the dry run if any hard stop is hit.

## Step-By-Step Dry Run

| Step | Source document | Dry-run question | Required dry-run result | Status |
|---:|---|---|---|---|
| 1 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md` | Does the package index exist and say production is not approved? | Must show `EVIDENCE_PACKAGE_INDEX_READY_PRODUCTION_NOT_APPROVED` and production `NO-GO` | `PENDING` |
| 2 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md` | Are production readiness gates documented? | Gates are present and do not instruct immediate production execution | `PENDING` |
| 3 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md` | Does the readiness record summarize remaining blockers? | Remaining blockers are explicit and do not claim production approval | `PENDING` |
| 4 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md` | Are blockers reviewed before approval? | Any unresolved blocker keeps approval at `NO-GO` | `PENDING` |
| 5 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md` | Are owner names and fixture labels non-secret? | Values are safe labels, not passwords, tokens, URLs, or private parish data | `PENDING` |
| 6 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md` | Does the validation gate support the filled checklist? | Validation result is present and does not bypass final approval | `PENDING` |
| 7 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md` | Are required sign-off roles named for future approval? | Product, technical, QA, security/data, rollback, monitoring, support, and evidence ownership are represented | `PENDING` |
| 8 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md` | Is there a place to record final sign-off decisions? | Sign-off fields are ready and not pre-approved | `PENDING` |
| 9 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md` | Are smoke-test data requirements documented? | Staff, parish, request, workflow step, documents, family portal token, monitoring, cleanup, and evidence needs are present | `PENDING` |
| 10 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md` | Are fixture labels and redaction expectations documented? | Fixture plan avoids real private records and raw token capture | `PENDING` |
| 11 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md` | Does every fixture label map to required future evidence? | Fixture-to-evidence map is complete and remains pending until approved rollout | `PENDING` |
| 12 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_CROSSWALK_20260629.md` | Does every rollout evidence section map to a checklist or readiness source? | Crosswalk is complete and production is still not approved | `PENDING` |
| 13 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md` | Is the actual rollout evidence template ready for a future approved window? | Template remains `PENDING`; no live evidence is invented | `PENDING` |
| 14 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md` | Are forward, verification, rollback, and decision steps documented? | Steps are clear and require explicit approval before execution | `PENDING` |
| 15 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md` | Is support posture ready? | Support owner/channel and parish-facing posture are documented | `PENDING` |
| 16 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md` | Is final go/no-go separate from this dry run? | Future approval requires an immediate `GO`; this dry run does not mark it `GO` | `PENDING` |
| 17 | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md` | Is the final approval prompt template narrow and explicit? | Includes approval phrase, target placeholders, excluded scopes, and hard stops | `PENDING` |
| 18 | `supabase/migrations/20260626170000_membership_aware_operational_rls.sql` | Is the forward migration identifiable without running it? | File path is known; dry run does not execute SQL | `PENDING` |
| 19 | `docs/sql/membership_aware_operational_rls_rollback_draft.sql` | Is the rollback SQL identifiable without running it? | File path is known; dry run does not execute SQL | `PENDING` |
| 20 | This checklist | Are all previous steps `PASS` and no hard stops hit? | If yes, dry-run outcome may be `PACKAGE_READY_FOR_HUMAN_APPROVAL_REQUEST`; otherwise `NO_GO` | `PENDING` |

## Dry-Run Outcome

Select exactly one outcome after completing the table:

- `PACKAGE_READY_FOR_HUMAN_APPROVAL_REQUEST`
- `NO_GO_MISSING_DOCUMENT`
- `NO_GO_MISSING_OWNER_OR_SIGNOFF`
- `NO_GO_MISSING_FIXTURE_MAPPING`
- `NO_GO_MISSING_ROLLBACK_OR_MONITORING`
- `NO_GO_SCOPE_DRIFT`
- `NO_GO_SECRET_OR_PRIVATE_DATA_PRESENT`
- `NO_GO_PRODUCTION_APPROVAL_ALREADY_ASSUMED`

Current dry-run outcome: `PENDING_NOT_RUN`

## Hard Stops

Stop the dry run and mark the outcome `NO_GO` if any of these occur:

- Any document says production RLS is already approved without the exact approval phrase.
- Any required evidence document is missing.
- Any owner/sign-off role is missing.
- Any fixture label cannot be mapped to evidence.
- Any rollback, support, or monitoring owner/channel is missing.
- Any production target includes a database URL, password, service-role key, session cookie, signed URL, raw token, or private parish data.
- The packet includes runtime public intake routing, AI production flags, Google Calendar mutation, unrelated deployments, or unrelated data cleanup.
- The dry run requires opening production systems, applying migrations, changing runtime behavior, changing operational RLS, touching Google Calendar data, mutating records, or exposing secrets.

## What Changed Plain English

This dry-run checklist lets someone rehearse the production RLS approval packet without touching production. It asks, "Is every document ready, every owner named, every smoke-test label mapped, and every rollback/monitoring step prepared?" If anything is missing, the rollout stays blocked.
