# Sacramental Record Correction And Notation Runtime Source Preflight Plan

Status: Source-level preflight scaffold prepared before runtime wiring. This is not runtime enforcement and does not approve a route, database write, production flag, migration, operational RLS change, sacramental record mutation, automatic certificate generation, canonical notation entry, canonical/sacramental eligibility decision, pastoral decision, storage access, AI call, Google Calendar call, export, or public trust claim.

Date prepared: 2026-07-02

Completion marker: `SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_PLAN_20260702`

## Current Decision State

`SOURCE PREFLIGHT PREPARED; RUNTIME SCAFFOLD NOT IMPLEMENTED; PRODUCTION CORRECTION AND NOTATION WORKFLOWS REMAIN NO-GO; AUTOMATIC REGISTER MUTATION REMAINS NO-GO`

## Source-Level Preflight Tests

The preflight scaffold lives in:

- `lib/server/sacramentalRecordRevisionRuntimePreflight.ts`
- `lib/server/sacramentalRecordRevisionRuntimePreflight.test.ts`

These tests are merge-time guards for a future implementation. They do not replace runtime QA, browser QA, product-owner approval, security/data approval, parish/canonical record owner approval, rollback evidence, or production smoke testing.

## Required Future Gate Order

Any future correction/notation runtime scaffold must prove these markers appear before any safe scaffold response or approved append-only review metadata write:

1. non-production gates
2. authentication
3. active-parish/membership scope
4. sacramental record ownership by selected active parish
5. request-to-record ownership
6. safe audit metadata before writes
7. forbidden mutation blocking
8. generic denial states
9. rollback/no-op behavior

The source validator anchors the first sensitive action at any future revision event write or scaffold response. A future implementation fails preflight if these gates appear after that anchor.

Each future gate must satisfy one complete marker set before any scaffold response or approved event write. A single partial marker, such as only naming the runtime gate helper or only naming the active parish context variable, is not enough to pass the source-level preflight.

## Forbidden Runtime Markers

The preflight validator rejects source sketches that include direct register mutation, automatic certificate generation, signed URL creation, storage delivery, AI calls, email/SMS sends, Google Calendar writes, or decision flags that claim canonical, pastoral, or sacramental eligibility decisions were made.

Forbidden marker examples include:

- `public.sacramental_records` update calls
- certificate generation calls
- signed URL creation calls
- OpenAI calls
- Google Calendar event calls
- `canonicalDecisionMade: true`
- `pastoralDecisionMade: true`
- `sacramentalEligibilityDecided: true`
- `mutatesSacramentalRecord: true`
- `generatesCertificateAutomatically: true`

## Current Boundary

This slice added source-level preflight scaffolding only. It did not:

- Wire `app/api/records/[id]/revision-review/route.ts`.
- Add dashboard controls.
- Write `public.sacramental_record_events`.
- Update `public.sacramental_records`.
- Apply migrations.
- Change operational RLS.
- Enable production flags.
- Generate certificates automatically.
- Enter canonical notations.
- Make pastoral decisions.
- Make canonical or sacramental eligibility decisions.
- Make public trust claims.

## What Changed Plain English

Vinea now has a safety test that future correction/notation route code will need to pass before it can be merged. The test checks that future code proves who the staff user is, which parish they are working in, whether the record and linked request belong to that parish, and whether safe audit information is ready before any review metadata is written or returned. It also blocks obvious unsafe code, like changing the sacramental register, generating certificates, calling AI, creating signed document links, or making canonical decisions.
