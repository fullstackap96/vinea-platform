# Membership-Aware Operational RLS Production Rollout Evidence Crosswalk - 2026-06-29

Status: Crosswalk prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this document.

## Purpose

Use this crosswalk during a future approved production rollout to pre-fill `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md` with references to the evidence requirements in `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md`.

This document does not approve production work. It does not verify production fixtures. It only explains where each future evidence item should be recorded and which checklist row proves it.

## Source Inputs

- Rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Smoke fixture verification checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md`
- Filled human intake checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md`
- Final approval prompt template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md`
- Production rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production final go/no-go checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md`

## Safety Boundaries

Do not use this crosswalk to access production, apply migrations, change runtime behavior, change operational RLS, touch Google Calendar data, mutate records, or expose secrets.

Do not paste passwords, database URLs, service-role keys, anon keys, OAuth secrets, access tokens, refresh tokens, authorization codes, OpenAI keys, raw family portal tokens, token hashes, signed document URLs, private document contents, internal note bodies, AI prompts, AI outputs, audit payload details, parishioner names, family names, phone numbers, emails, addresses, funeral details, pastoral details, canonical details, or real private documents.

Allowed evidence labels are safe labels, timestamps, HTTP status codes, health-check booleans, redacted screenshot labels, redacted command-output labels, audit event names without private payloads, monitoring summaries, cleanup confirmations, and explicit statements that raw secrets were not recorded.

## Rollout Template Crosswalk

Use the table below to prepare the production rollout evidence file after a separate production approval is granted. Leave actual results as `PENDING` until the approved rollout window.

| Rollout evidence template section | Pre-fill reference | Required future evidence | Pass criteria source |
|---|---|---|---|
| Rollout Identity | Final approval prompt template and filled human intake checklist | Evidence owner, operator, rollout window, rollback deadline, production app host label, production database host label, release label, approval prompt/link | Final approval prompt hard stops and rollout evidence template pass criteria |
| Completed Smoke-Test Data Checklist | Human intake checklist and smoke fixture verification checklist | Staff account label, active parish label, same-parish request label, denied request label, workflow step label, staff document label, family document label, family portal lifecycle plan, cleanup plan | Smoke fixture verification checklist `Fixture-To-Evidence Map` |
| Named Sign-Offs | Human intake checklist and final go/no-go checklist | Product, technical, QA, security/data, and rollback owner decisions | Final go/no-go checklist and rollout evidence template `Named Sign-Offs` pass criteria |
| Automated Checks | Production-intended commit only | Test, lint, and build result labels without secrets | Rollout evidence template `Automated Checks` pass criteria |
| Pre-Apply Health | Smoke fixture verification checklist route evidence | HTTP status, `ok`, `checks.schema`, `checks.supabase`, baseline monitoring label | Smoke fixture verification checklist `/api/health before apply` row |
| Forward Migration Output | Rollout/rollback packet | Sanitized command-output label and exit status only | Rollout evidence template `Forward Migration Output` pass criteria |
| Post-Apply Health | Smoke fixture verification checklist route evidence | HTTP status, `ok`, `checks.schema`, `checks.supabase`, post-apply monitoring label | Smoke fixture verification checklist `/api/health after apply` row |
| Policy Shape Verification | Rollout/rollback packet and migration candidate | Sanitized policy-shape query-output label | Rollout evidence template `Policy Shape Verification` pass criteria |
| Active-Parish-Cookie Request And Document Smoke | Smoke fixture verification checklist request, workflow step, staff document, and direct storage rows | Staff sign-in result, active parish observation, request detail result, document panel result, staff upload result, signed route result, direct storage privacy result, approve/reject result, no unrelated parish data result | Smoke fixture verification checklist `Request detail`, `Request documents`, and `Direct storage privacy` rows |
| Family Portal Safety Smoke | Smoke fixture verification checklist family document and token lifecycle rows | Portal token lifecycle result, clean-session portal result, safe family-facing field result, exclusion checks, family upload result, staff visibility result | Smoke fixture verification checklist `Family portal` and `Family portal exclusions` rows |
| Monitoring Observations | Human intake monitoring owner/channel and smoke fixture monitoring row | 30-minute health, auth, request, document, family portal, and RLS monitoring labels | Smoke fixture verification checklist `Monitoring` row |
| Cleanup And Deactivation | Smoke fixture verification cleanup row | Synthetic document cleanup, token lifecycle closure, request/status restoration, workflow-step restoration, evidence review result | Smoke fixture verification checklist cleanup and redaction row |
| Rollback Decision | Rollout/rollback packet | Continue, rollback, or hold decision with decision maker and deadline | Rollout evidence template `Rollback Decision` criteria |
| Final Outcome | Rollout evidence template and final approval readiness record | Final state, unresolved issues, follow-up owner, evidence package location, product owner acknowledgement | Rollout evidence template `Final Outcome` allowed outcomes |

## Future Evidence Pre-Fill Values

Copy these safe placeholders into the rollout evidence template after the separate production approval is granted. Do not replace `PENDING` values until the rollout is actually being performed.

| Evidence template field | Safe pre-fill value |
|---|---|
| Evidence owner | `Alex Perez - Evidence Owner` |
| Rollback owner | `Alex Perez - Rollback Owner - available during rollout window` |
| Monitoring owner/channel | `Alex Perez - Local Codex session and Vercel/Supabase dashboards` |
| Evidence package location | `Vinea Production RLS Evidence Folder - restricted` |
| Public intake runtime routing unchanged | `Confirm unchanged during rollout; public intake runtime routing is out of scope` |
| Operational RLS production approval prompt/link | `PENDING - must link explicit approval containing APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT` |
| Final approval readiness decision is `GO` | `PENDING - must be confirmed immediately before rollout` |
| Staff account selected | `Production RLS Smoke Staff Account - no password recorded` |
| Active parish selected | `Production RLS Smoke Parish A` |
| Cross-parish denied parish/substitute | `Production RLS Denial Parish B` |
| Production-safe request selected | `Production RLS Smoke Request A - non-sensitive` |
| Cross-parish denied request selected | `Production RLS Denied Request B - generic denial expected` |
| Workflow step selected | `Production RLS Smoke Workflow Step - document safe` |
| Staff test document content prepared | `Vinea production RLS smoke test staff document - synthetic file only` |
| Family test document content prepared | `Vinea production RLS smoke test family document - synthetic file only` |
| Family portal token plan prepared | `Create during smoke window; do not record raw token; deactivate immediately after smoke` |
| Cleanup/evidence plan prepared | `Delete synthetic docs, deactivate token, restore request status if changed` |

## Evidence Labels To Capture Later

During the future approved rollout, capture these labels without secrets:

- `pre_apply_health_result`
- `forward_migration_sanitized_output`
- `post_apply_health_result`
- `policy_shape_sanitized_output`
- `same_parish_request_detail_result`
- `cross_parish_request_denial_result`
- `same_parish_document_route_result`
- `cross_parish_document_denial_result`
- `direct_storage_privacy_result`
- `family_portal_clean_session_result`
- `family_portal_exclusion_result`
- `audit_event_name_timestamp_result`
- `monitoring_30_minute_result`
- `cleanup_redaction_result`
- `rollback_decision_result`
- `final_outcome_result`

## Hard Stops

Do not proceed with production RLS rollout evidence capture if any of these are true:

- The explicit production approval phrase is missing.
- Production target labels are missing or include a secret connection value.
- The final go/no-go checklist is not `GO`.
- The smoke fixture verification checklist is missing or incomplete.
- The staff account, active parish, same-parish request, denied request, workflow step, document, family portal, cleanup, monitoring, or rollback evidence item cannot be mapped to a safe fixture label.
- Any raw secret, private parish data, raw token material, signed document URL, private document content, internal note, AI output, or private audit payload appears in evidence.
- Any smoke check violates the hard stops in `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md`.

## Current Decision

Current decision: `CROSSWALK_READY_PRODUCTION_NOT_APPROVED`

This means the rollout evidence template now has a safe pre-fill map. It does not mean production was accessed, production fixtures were verified, production RLS was approved, or a production rollout was executed.

## What Changed Plain English

This crosswalk tells the future rollout operator exactly where each piece of evidence belongs. It connects the production evidence template to the smoke fixture checklist, so when approval eventually happens, the operator can fill the evidence packet without guessing and without recording secrets.
