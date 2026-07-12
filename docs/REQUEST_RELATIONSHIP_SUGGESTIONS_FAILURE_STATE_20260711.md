# Request Relationship Suggestions Failure State

Decision: `REQUEST_RELATIONSHIP_SUGGESTIONS_FAILURE_STATE_IMPLEMENTED_20260711`

Status: Implemented and verified locally without accessing production or mutating records.

## What Changed

The Request Detail Suggested connections card now distinguishes a successful empty result from an unavailable authenticated relationship lookup. Failed responses and unexpected network errors show clear staff guidance instead of silently hiding the card.

Each lookup owns an abort controller. When request, person, or selected-parish-derived scope changes, the obsolete browser request is cancelled and cannot settle the current card. A current failed read always leaves loading state, so the card does not remain stuck indefinitely.

## Plain English

Staff can now tell the difference between “Vinea found no suggestions” and “Vinea could not check.” That prevents silence or a permanent loading message from being mistaken for verified relationship information.

## Preserved Boundaries

- The existing staff-authenticated, active-parish request API remains authoritative.
- Suggestions remain read-only and staff-reviewed; no link, profile, household, or request is changed automatically.
- No production access, shared-QA access, mutation, migration, operational RLS change, communication, provider call, AI call, export, storage access, signed URL, certificate generation, sensitive flag change, or public trust claim occurred.

## Rollback

Restore the prior effect and empty-result rendering. No data rollback or migration is required.

## Verification

- Combined relationship-suggestion, person-link, active-parish scope, safe-link, safe-message, and Server Action regression passed with 7 files and 29 tests.
- ESLint passed with no findings.
- All-file TypeScript checking passed.
- Production-gate validation passed with all 15 artifacts linked and sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- `git diff --check` passed; existing line-ending notices are informational only.
