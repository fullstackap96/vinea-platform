# Mass Intention Form Persistence Freeze

Decision: `MASS_INTENTION_FORM_PERSISTENCE_FREEZE_IMPLEMENTED_20260711`

Status: Implemented and verified locally without accessing production or mutating Mass Intentions.

## What Changed

Mass Intention create and edit now freeze the complete reviewed snapshot while their existing selected-parish Server Action is unresolved. Requester, intention text, requested and assigned dates, assigned priest, stipend status, fulfillment status, notes, submit, and cancel controls all remain unavailable until a returned or thrown failure releases the form. Successful persistence remains pending through navigation.

The shared form also rejects programmatic field patches while saving. Accessible busy state and visible `Saving...` feedback remain on the form.

Priest-directory loading behavior is unchanged: selected-parish Settings remains the source when available, and the existing free-text priest fallback remains available when the optional directory cannot load.

## Plain English

Once staff press Save, the Mass Intention form now stays exactly as reviewed until Vinea confirms the result. The screen cannot show newer edits that were not part of the submitted record.

## Preserved Boundaries

- Existing create/edit single-flight locks, selected-parish Server Actions, validation, stipend handling, fulfillment semantics, and navigation remain unchanged.
- No automatic scheduling, stipend accounting, Mass assignment, fulfillment decision, communication, or canonical/pastoral decision was added.
- No production access, shared-QA access, record mutation during verification, migration, operational RLS change, provider call, Google Calendar call, AI call, export, storage access, signed URL, certificate generation, sensitive flag change, or public trust claim occurred.
- This is a same-screen persistence freeze, not durable idempotency or a database transaction.

## Rollback

Remove the saving guards from the shared form. No data rollback or migration is required.

## Verification

- Focused Mass Intention form plus core-record create/edit single-flight regression passed with 3 files and 18 tests.
- ESLint passed with no findings.
- All-file TypeScript checking passed.
- Production-gate validation passed with all 15 artifacts linked and sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- The immediately preceding full repository baseline passed with 788 test files and 3,345 tests; this slice then passed its focused regression.
- `git diff --check` passed; existing line-ending notices are informational only.
