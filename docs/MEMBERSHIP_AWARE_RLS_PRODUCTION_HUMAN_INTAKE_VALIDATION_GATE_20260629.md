# Membership-Aware Operational RLS Production Human Intake Validation Gate - 2026-06-29

Status: Validation gate prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this gate.

## Purpose

Use this gate after the product owner fills `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md` with real non-secret owner names, safe fixture labels, rollout timing, monitoring ownership, rollback ownership, and evidence storage details.

This gate does not approve production work. It only tells Vinea whether the filled intake packet is complete enough to ask for a separate product-owner production approval prompt.

## Source Inputs

Required source packet:

- Human intake checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md`

Supporting cross-check documents:

- Readiness packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_PACKET_20260629.md`
- Owner/fixture capture form: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md`
- Final go/no-go review checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md`
- Production blocker register: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md`
- Rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`

## Non-Negotiable Safety Boundaries

The validation must stop with `NO_GO_SCOPE_OR_SECRET_RISK` if any of these are false:

- Production was not accessed during validation.
- No production migration was applied during validation.
- Runtime behavior was not changed during validation.
- Operational RLS was not changed during validation.
- Google Calendar data was not touched during validation.
- Parish records, request records, communication records, document records, audit events, staff records, and family portal records were not mutated during validation.
- No passwords, database URLs, service-role keys, anon keys, OAuth secrets, access tokens, refresh tokens, OpenAI API keys, raw portal tokens, token hashes, signed URLs, private document bodies, internal notes, AI prompts, AI outputs, or private audit payloads are present in the filled packet.
- No sensitive parishioner names, family names, phone numbers, emails, pastoral details, funeral details, canonical details, or real private documents are present in the filled packet.

## Validation Steps

Run these checks in order. Stop at the first hard failure and record the exact `NO_GO_*` decision.

| Step | Check | Pass criteria | Failure decision |
|---:|---|---|---:|
| 1 | Source identity | Filled packet is based on the current human intake checklist and references the production-intended commit or release label without credentials | `NO_GO_SOURCE_MISMATCH` |
| 2 | Owner completeness | Product, technical, QA, security/data, rollback, monitoring, support, and evidence storage owners are named with non-secret contact paths | `NO_GO_MISSING_OWNER` |
| 3 | Fixture completeness | Staff account label, active parish label, same-parish request label, cross-parish denied request label, workflow step label, staff document label, family document label, token plan, cleanup plan, and redaction rules are filled | `NO_GO_MISSING_FIXTURE` |
| 4 | Fixture safety | Fixtures are non-sensitive, reversible where applicable, synthetic for documents, and approved by product, QA, and security/data owners | `NO_GO_UNSAFE_FIXTURE` |
| 5 | Rollout readiness | Rollout window, rollback deadline, rollback owner availability, monitoring channel, support escalation path, and evidence storage location are filled | `NO_GO_MISSING_ROLLOUT_OR_ROLLBACK` |
| 6 | Forbidden content scan | Filled packet contains no forbidden secrets, raw tokens, signed URLs, private data, private document content, internal note bodies, AI raw material, or known QA fixture ids | `NO_GO_FORBIDDEN_CONTENT` |
| 7 | Scope guard | Packet confirms public intake runtime routing, AI production flags, Google Calendar mutation, and unrelated deployments remain out of scope unless separately approved | `NO_GO_SCOPE_DRIFT` |
| 8 | Final approval boundary | Packet states that production remains blocked until a separate explicit product-owner production approval prompt is provided | `NO_GO_APPROVAL_BOUNDARY_MISSING` |

## Required Filled-Packet Status Changes

Before this validation can recommend `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`, the filled packet must replace placeholder/incomplete values with safe completed values.

Hard-stop incomplete markers:

- `UNKNOWN`
- `INCOMPLETE`
- `PENDING`
- `NOT_PROVIDED`
- `REQUIRES_HUMAN_CONFIRMATION`
- `PROVIDE_`
- `TODO`
- `TBD`

Allowed redaction markers:

- `REDACTED`
- `safe label only`
- `no password recorded`
- `do not record raw token`

## Forbidden Content Pattern Checks

The validation should reject a filled packet containing obvious credential-like or private-link markers, including:

- `postgresql://`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- `GOOGLE_CLIENT_SECRET=`
- `OPENAI_API_KEY=`
- `access_token=`
- `refresh_token=`
- `X-Amz-Signature`
- `token=`
- `token_hash`
- `signedUrl`
- `calendarId=`
- `eventId=`
- Known shared-QA fixture ids: `735840c9-a276-4b3d-9773-7b350c9fc35c` and `f4a50f8b-4039-46d7-902f-a40719a12718`

## Validation Output Template

Use this output after validating a filled packet.

| Field | Value |
|---|---:|
| Validation run date | `YYYY-MM-DD` |
| Validated checklist path or evidence label | `SAFE_LABEL_ONLY` |
| Production accessed during validation | `NO` |
| Migrations applied during validation | `NO` |
| Runtime behavior changed during validation | `NO` |
| Operational RLS changed during validation | `NO` |
| Google Calendar data touched during validation | `NO` |
| Records mutated during validation | `NO` |
| Secrets/private data found | `NO` |
| Owners complete | `YES / NO` |
| Fixtures complete and safe | `YES / NO` |
| Rollout and rollback complete | `YES / NO` |
| Scope guard complete | `YES / NO` |
| Separate product-owner production approval still required | `YES` |
| Validation decision | `GO_READY_FOR_PRODUCT_OWNER_APPROVAL / NO_GO_*` |

## Allowed Decisions

- `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`
- `NO_GO_SOURCE_MISMATCH`
- `NO_GO_MISSING_OWNER`
- `NO_GO_MISSING_FIXTURE`
- `NO_GO_UNSAFE_FIXTURE`
- `NO_GO_MISSING_ROLLOUT_OR_ROLLBACK`
- `NO_GO_FORBIDDEN_CONTENT`
- `NO_GO_SCOPE_DRIFT`
- `NO_GO_APPROVAL_BOUNDARY_MISSING`
- `NO_GO_SCOPE_OR_SECRET_RISK`

Current decision: `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`

Latest filled-checklist validation result:

| Field | Value |
|---|---:|
| Validation run date | `2026-06-29` |
| Validated checklist path or evidence label | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md` |
| Production accessed during validation | `NO` |
| Migrations applied during validation | `NO` |
| Runtime behavior changed during validation | `NO` |
| Operational RLS changed during validation | `NO` |
| Google Calendar data touched during validation | `NO` |
| Records mutated during validation | `NO` |
| Secrets/private data found | `NO` |
| Owners complete | `YES` |
| Fixtures complete and safe | `YES` |
| Rollout and rollback complete | `YES` |
| Scope guard complete | `YES` |
| Separate product-owner production approval still required | `YES` |
| Validation decision | `GO_READY_FOR_PRODUCT_OWNER_APPROVAL` |

## What Changed Plain English

This gate is the safety check for the checklist you filled out. It tells us how to review the filled packet without exposing secrets or touching production. The owner names, safe test labels, rollback plan, monitoring plan, and evidence plan are now complete enough to ask for a separate final production approval prompt. Production is still not approved.

## Recommended Next Step

Have the product owner provide a separate explicit production approval prompt if and when Vinea is ready to schedule the production RLS rollout. Do not apply production RLS from this validation gate alone.
