# Core Record Reviewed-Form Persistence Freeze

Decision: `CORE_RECORD_REVIEWED_FORM_PERSISTENCE_FREEZE_IMPLEMENTED_20260711`

Status: Implemented and verified locally without accessing production or mutating records.

## What Changed

People, Household, and Sacramental Record create/edit forms now freeze their complete reviewed state while existing selected-parish persistence is unresolved.

- People freezes identity, contact, birth date, notes, and navigation.
- Household freezes household details, existing-member relationships and primary-contact choices, the add-member draft, and navigation across both save and add-member operations.
- Sacramental Records freeze record type, person name, sacrament date, minister, place, register references, notes, and navigation.

Each shared form also rejects programmatic field patches while busy. Existing accessible busy state now corresponds to every visible editable control, with plain `Saving...` and `Adding...` progress labels.

## Plain English

After staff press Save or Add, the reviewed record stays visually fixed until Vinea confirms the result. Staff never see a form that appears to contain changes that were not part of the request already being processed.

## Preserved Boundaries

- Existing selected-parish Server Actions, authentication, ownership checks, validation, partial-success handling, and single-flight locks remain authoritative.
- No automatic household decision, primary-contact decision, sacramental/canonical decision, record correction, notation, or certificate generation was added.
- No production access, shared-QA access, record mutation during verification, migration, operational RLS change, communication, provider call, Google Calendar call, AI call, export, storage access, signed URL, sensitive flag change, or public trust claim occurred.
- This is same-screen state integrity, not durable idempotency or a database transaction.

## Rollback

Remove the busy guards from the three shared forms. No data rollback or migration is required.

## Verification

- Focused core-record reviewed-form, create/edit single-flight, and Household member action regression passed with 4 files and 35 tests.
- ESLint passed with no findings.
- All-file TypeScript checking passed.
- Production-gate validation passed with all 15 artifacts linked and sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- The immediately preceding full repository baseline passed with 788 test files and 3,345 tests; this slice then passed its focused regression.
- `git diff --check` passed; existing line-ending notices are informational only.
