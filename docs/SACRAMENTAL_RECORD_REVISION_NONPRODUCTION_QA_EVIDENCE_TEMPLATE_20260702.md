# Sacramental Record Correction And Notation Non-Production QA Evidence Template

Status: Prepared as a non-production QA evidence template only.

Date prepared: 2026-07-02

Completion marker: `SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702`

## Current Decision State

`SACRAMENTAL RECORD REVISION NON-PRODUCTION QA NOT EXECUTED; RUNTIME SCAFFOLD NOT IMPLEMENTED; PRODUCTION CORRECTION AND NOTATION WORKFLOWS REMAIN NO-GO; AUTOMATIC REGISTER MUTATION REMAINS NO-GO`

This template is for a future non-production QA run only. It does not approve runtime implementation, migrations, operational RLS changes, sacramental record mutation, production flags, automatic certificate generation, canonical notation entry, pastoral decisions, canonical or sacramental eligibility decisions, public trust claims, storage access, signed URL access, or family-facing revision workflows.

Use labels and pass/fail outcomes only. Do not paste raw IDs, raw register notes, private document contents, storage paths, signed URLs, original filenames, token material, database URLs, service-role keys, OpenAI keys, Google credentials, family portal secrets, raw exports, or raw metadata into this evidence.

## Related Materials

- DTO foundation: `docs/SACRAMENTAL_RECORD_REVISION_DTO_PLAN_20260702.md`
- Runtime scaffold approval packet: `docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md`
- Runtime source preflight plan: `docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_PLAN_20260702.md`
- DTO implementation: `lib/sacramentalRecordRevisionDtos.ts`
- Source preflight validator: `lib/server/sacramentalRecordRevisionRuntimePreflight.ts`
- Source preflight tests: `lib/server/sacramentalRecordRevisionRuntimePreflight.test.ts`
- Future event action names: `sacramental_record_correction_reviewed` and `sacramental_record_notation_reviewed`

## Required Future Non-Production Gates

The future runtime scaffold must remain unavailable unless all of these exact flags are set in a non-production environment:

- `VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME=ENABLED`
- `VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK=APPROVED_SACRAMENTAL_RECORD_REVISION_QA`
- `VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV=NON_PRODUCTION`

Production flags are not defined or approved by this template. Production correction and notation workflows remain NO-GO.

## Environment Identity

| Field | Non-secret label |
|---|---|
| QA run date/time | `[PENDING]` |
| App target label | `[PENDING]` |
| Supabase/project label | `[PENDING]` |
| QA operator label | `[PENDING]` |
| Safe staff user fixture label | `[PENDING]` |
| Active parish fixture label | `[PENDING]` |
| Denied parish fixture label | `[PENDING]` |
| Same-parish correction review fixture | `[PENDING]` |
| Same-parish notation review fixture | `[PENDING]` |
| Linked request fixture | `[PENDING]` |
| Missing request link fixture | `[PENDING]` |
| Cross-parish denied record fixture or forged active-parish substitute | `[PENDING]` |
| Family portal or unauthenticated denial method | `[PENDING]` |
| Monitoring owner/channel | `[PENDING]` |
| Rollback owner | `[PENDING]` |
| Evidence storage owner | `[PENDING]` |

## Preflight Checklist

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Non-production target confirmed | Target is not production | `[PENDING]` | `[PENDING]` |
| Product-owner approval for QA run captured | Exact future approval phrase supplied | `[PENDING]` | `[PENDING]` |
| Security/data owner aware | Owner confirms evidence must remain label-only | `[PENDING]` | `[PENDING]` |
| Parish/canonical record owner aware | Owner confirms no automatic register mutation or canonical notation entry | `[PENDING]` | `[PENDING]` |
| Safe fixtures selected | Fixture labels avoid private family data and raw IDs where possible | `[PENDING]` | `[PENDING]` |
| Rollback owner available | Owner can disable flags during the run | `[PENDING]` | `[PENDING]` |
| Monitoring channel available | QA notes and errors can be observed | `[PENDING]` | `[PENDING]` |

## Gate 0: Flag-Off Baseline

Run this before enabling any non-production revision scaffold flags.

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Route or scaffold with flags off | Runtime route is unavailable or no-op | `[PENDING]` | `[PENDING]` |
| Record detail baseline | Existing record page behavior remains unchanged | `[PENDING]` | `[PENDING]` |
| Correction metadata baseline | No correction metadata is created | `[PENDING]` | `[PENDING]` |
| Notation metadata baseline | No notation metadata is created | `[PENDING]` | `[PENDING]` |
| Sacramental record mutation baseline | No `public.sacramental_records` values change | `[PENDING]` | `[PENDING]` |
| Certificate baseline | No certificates are generated automatically | `[PENDING]` | `[PENDING]` |
| Decision baseline | No canonical, sacramental eligibility, or pastoral decision is made | `[PENDING]` | `[PENDING]` |

## Gate 1: Flag-On Non-Production Scaffold Checks

Set only the exact non-production flags listed above. The future scaffold should prepare safe staff-reviewed metadata only after all scope checks pass.

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Flag state | All required non-production flags are exact | `[PENDING]` | `[PENDING]` |
| Staff authentication | Authenticated staff can reach the scaffold only through the approved non-production path | `[PENDING]` | `[PENDING]` |
| Safe response shape | Response contains safe review metadata only | `[PENDING]` | `[PENDING]` |
| Staff review preserved | `staffReviewRequired` remains true | `[PENDING]` | `[PENDING]` |
| Authorized record review preserved | `authorizedRecordReviewRequired` remains true | `[PENDING]` | `[PENDING]` |
| Runtime persistence boundary | Any approved event write remains append-only safe metadata and does not change sacramental records | `[PENDING]` | `[PENDING]` |

## Active-Parish And Membership Scope

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Same-parish active scope | Staff member can prepare safe metadata for a record owned by the selected active parish | `[PENDING]` | `[PENDING]` |
| Membership check | Staff membership in the selected active parish is required | `[PENDING]` | `[PENDING]` |
| Forged active parish | Forged or unauthorized active parish context is denied generically | `[PENDING]` | `[PENDING]` |
| Cross-parish denial | Record owned by another parish is denied before metadata preparation, event write, or display | `[PENDING]` | `[PENDING]` |
| Existing RLS boundary | Operational RLS is not changed or bypassed | `[PENDING]` | `[PENDING]` |

## Request-To-Record Continuity

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Linked request fixture | Same-parish linked request relationship is preserved in safe metadata | `[PENDING]` | `[PENDING]` |
| Linked request parish ownership | Linked request must belong to the same parish as the record | `[PENDING]` | `[PENDING]` |
| Missing request link fixture | Missing request link is shown as a manual continuity review need, not an error that edits records | `[PENDING]` | `[PENDING]` |
| Request completion boundary | Request status is not changed by the scaffold | `[PENDING]` | `[PENDING]` |

## Correction Review

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Same-parish correction review | Safe correction review metadata can be prepared for the approved fixture | `[PENDING]` | `[PENDING]` |
| Affected fields | Affected fields are label-only and safe | `[PENDING]` | `[PENDING]` |
| Correction status | Status is one of the approved staff-reviewed statuses | `[PENDING]` | `[PENDING]` |
| Correction action name | Future action is `sacramental_record_correction_reviewed` | `[PENDING]` | `[PENDING]` |
| Correction boundary | Correction review does not update book, page, line, minister, place, person, sacrament date, notes, or register values | `[PENDING]` | `[PENDING]` |

## Notation Review

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Same-parish notation review | Safe notation review metadata can be prepared for the approved fixture | `[PENDING]` | `[PENDING]` |
| Notation category | Notation category is a safe label and not raw canonical text | `[PENDING]` | `[PENDING]` |
| Notation status | Status is one of the approved staff-reviewed statuses | `[PENDING]` | `[PENDING]` |
| Notation action name | Future action is `sacramental_record_notation_reviewed` | `[PENDING]` | `[PENDING]` |
| Notation boundary | Review does not enter a canonical notation or modify the sacramental register | `[PENDING]` | `[PENDING]` |

## Cross-Parish Denial

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Cross-parish record access | Denied with generic text | `[PENDING]` | `[PENDING]` |
| Cross-parish linked request | Denied before safe metadata is prepared | `[PENDING]` | `[PENDING]` |
| Denied audit metadata | If audit writing is approved, denied metadata contains safe blocked reason only | `[PENDING]` | `[PENDING]` |
| Forbidden details | Response does not reveal whether the denied record, request, or parish exists | `[PENDING]` | `[PENDING]` |

## Family And Unauthenticated Denial

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Unauthenticated request | Denied generically | `[PENDING]` | `[PENDING]` |
| Family portal context | Denied generically and exposes no revision metadata | `[PENDING]` | `[PENDING]` |
| Token material | No token material is accepted, logged, returned, or recorded in evidence | `[PENDING]` | `[PENDING]` |
| Family-facing boundary | Correction and notation review remain staff-only | `[PENDING]` | `[PENDING]` |

## Safe Audit Metadata Checks

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Feature id | `sacramental_record_revision_v1` | `[PENDING]` | `[PENDING]` |
| Event action | Correction or notation action name is exact | `[PENDING]` | `[PENDING]` |
| Revision kind | Correction or notation kind is present | `[PENDING]` | `[PENDING]` |
| Active parish scope | Safe active parish label/reference is present | `[PENDING]` | `[PENDING]` |
| Actor label | Staff actor label is present without secrets | `[PENDING]` | `[PENDING]` |
| Safe affected fields | Label-only affected fields are present | `[PENDING]` | `[PENDING]` |
| Linked request flag | Linked request status is shown without private request data | `[PENDING]` | `[PENDING]` |
| Decision flags | Canonical, pastoral, and eligibility decision flags remain false/blocked | `[PENDING]` | `[PENDING]` |
| Mutation flags | Sacramental record mutation and automatic certificate generation flags remain false/blocked | `[PENDING]` | `[PENDING]` |
| Blocked reason | Denied paths use generic safe blocked reason labels | `[PENDING]` | `[PENDING]` |
| Forbidden audit data | No raw notes, raw record values, document contents, storage paths, signed URLs, original filenames, token material, communication bodies, AI prompts, AI outputs, provider payloads, database URLs, service-role keys, raw exports, or secret values | `[PENDING]` | `[PENDING]` |

## Forbidden Mutation Checks

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Sacramental records table | No `public.sacramental_records` update occurs | `[PENDING]` | `[PENDING]` |
| Register fields | No book, page, line, minister, place, person, sacrament date, or notes are changed | `[PENDING]` | `[PENDING]` |
| Canonical notation | No canonical notation is entered | `[PENDING]` | `[PENDING]` |
| Record lock state | No lock/unlock state is changed | `[PENDING]` | `[PENDING]` |
| Certificate generation | No certificate is generated automatically | `[PENDING]` | `[PENDING]` |
| Request completion | No request is marked complete | `[PENDING]` | `[PENDING]` |
| Outbound communications | No email or SMS is sent | `[PENDING]` | `[PENDING]` |
| Calendar, AI, exports, storage | No Google Calendar, AI, export, storage, signed URL, public intake, or document-file behavior is invoked | `[PENDING]` | `[PENDING]` |
| Database governance | No migrations are applied and operational RLS is not changed | `[PENDING]` | `[PENDING]` |
| Public claims | No public trust claims are made | `[PENDING]` | `[PENDING]` |

## Rollback Verification

Disable or invalidate the non-production runtime flags.

| Check | Expected result | Evidence label | Result |
|---|---|---|---|
| Flags disabled | Runtime route or scaffold returns unavailable/no-op behavior | `[PENDING]` | `[PENDING]` |
| Post-rollback correction attempt | No new correction metadata is created | `[PENDING]` | `[PENDING]` |
| Post-rollback notation attempt | No new notation metadata is created | `[PENDING]` | `[PENDING]` |
| Record values after rollback | Sacramental record values remain unchanged | `[PENDING]` | `[PENDING]` |
| Certificate behavior after rollback | No new automatic certificate generation behavior exists | `[PENDING]` | `[PENDING]` |
| Monitoring after rollback | No unexpected errors or writes continue after rollback | `[PENDING]` | `[PENDING]` |
| Database rollback | No database rollback is required for flag rollback if no persistence gate was approved | `[PENDING]` | `[PENDING]` |

## Production NO-GO Criteria

Production correction and notation workflows remain NO-GO if any of these are true:

- This QA evidence is not completed.
- Runtime scaffold source-level preflight tests are missing or failing.
- Non-production route/browser smoke is missing or failing.
- Active-parish or membership scope checks fail.
- Cross-parish, family, or unauthenticated denial leaks private details.
- Any path mutates `public.sacramental_records`.
- Any path enters canonical notation text automatically.
- Any path generates certificates automatically.
- Any path makes canonical, sacramental eligibility, or pastoral decisions.
- Safe audit metadata is missing or contains forbidden data.
- Rollback by disabling flags is not verified.
- Production-safe fixtures, monitoring owner, rollback owner, support owner, evidence storage owner, and named sign-offs are missing.
- A separate production approval packet and exact production approval prompt are not completed.

Current production recommendation: `NO-GO`.

## Final Sign-Off

| Role | Name/label | Decision | Date/time | Notes |
|---|---|---|---|---|
| Product owner | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| Parish/canonical record owner | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| Security/data owner | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| QA owner | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| Support owner | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| Rollback owner | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |
| Evidence storage owner | `[PENDING]` | `[PENDING]` | `[PENDING]` | `[PENDING]` |

## Unresolved Risks

| Risk | Owner | Mitigation | Status |
|---|---|---|---|
| Runtime scaffold not implemented | Product/Engineering | Require separate implementation approval and source-level preflight tests | `Open` |
| Correction/notation event persistence not approved | Product/Security | Keep evidence template and future scaffold non-production gated | `Open` |
| Production-safe fixture selection missing | Product/QA | Use label-only fixture worksheet before production approval | `Open` |
| Canonical notation policy varies by parish/diocese | Parish/canonical record owner | Require human policy review before any production workflow | `Open` |
| Public trust claims not approved | Product/Security | Keep public trust-center claims NO-GO | `Open` |

## Current Outcome

Current outcome: `[PENDING - QA NOT EXECUTED]`

Recommended next state after this template is reviewed: `Prepare source-level preflight tests for the future correction/notation runtime scaffold, or request explicit product-owner approval for the non-production scaffold implementation.`

## What Changed Plain English

This template gives Vinea a safe checklist for a future test of correction and notation review. It makes sure staff can prove that the future feature is parish-scoped, staff-only, reversible by turning off flags, and unable to change sacramental registers or make canonical decisions by itself. It also tells testers not to paste private parish data, document details, tokens, IDs, or secrets into the evidence.
