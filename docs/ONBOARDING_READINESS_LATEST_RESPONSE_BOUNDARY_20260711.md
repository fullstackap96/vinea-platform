# Onboarding Readiness Latest Response Boundary - 2026-07-11

Status: `ONBOARDING_READINESS_LATEST_RESPONSE_IMPLEMENTED_20260711`

## What Changed

- The dashboard setup card and full Onboarding page now use abortable latest-request-wins loads.
- A new load cancels the older Settings and Staff Access requests.
- Only the newest owned result may settle parish details, staff evidence, errors, or loading state.
- Selected-parish shell remount invalidates and cancels outgoing readiness work.
- Both Settings and Staff Access must return validated evidence before readiness is calculated.
- A failed or malformed Staff Access read does not masquerade as zero staff or incomplete setup.
- The readiness model keeps only staff role and activation state; staff IDs, emails, and timestamps are discarded.
- The dashboard card now shows a calm unavailable state instead of an inaccurate checklist when evidence is incomplete.

## Plain-English Result

Vinea no longer guesses that a parish has no staff just because part of the setup check failed. The setup card and Onboarding page wait for the newest verified parish and staff evidence, then show one trustworthy readiness result.

## Preserved Boundaries

- Existing authenticated selected-parish Settings and Staff Access APIs remain authoritative.
- Existing staff-reviewed onboarding completion behavior and single-flight write boundary remain unchanged.
- No onboarding or settings mutation occurred during verification.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No communication, provider, Calendar, AI, export, storage, or signed-URL action occurred.

## Rollback

Revert the shared read-model parser and sequence/abort coordination. No schema, data, environment, or feature-flag rollback is required.
