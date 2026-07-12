# Request Person-Link Lookup Fail-Closed Boundary

Decision: `REQUEST_PERSON_LINK_LOOKUP_FAIL_CLOSED_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without accessing production or mutating records.

## What Changed

The Request Detail People directory handoff now distinguishes three read states: checking, ready, and unavailable. A failed relationship-suggestion lookup does not mean that no matching person exists. The card therefore shows no link/create controls until its authenticated active-parish lookup succeeds.

The lookup owns an abort controller so obsolete request/person context cannot update the card after route data changes. Missing request parish context remains a safe no-query state.

Link-existing and create-profile actions now share one immediate browser lock before their existing selected-parish Server Actions. Returned and thrown failures release cleanly. After confirmed persistence, a failed Request Detail refresh produces explicit partial-success guidance so staff refresh the page instead of retrying and risking a duplicate profile.

## Plain English

If Vinea cannot check the People directory, it now says so and pauses. It no longer turns a network problem into a suggestion to create a new person.

Once staff choose to link or create a profile, rapid repeat clicks cannot launch a competing action. If the profile is confirmed but the screen refresh fails, Vinea tells staff what succeeded and asks them to refresh before doing anything else.

## Preserved Boundaries

- Existing active-parish membership and same-parish request ownership remain authoritative in the Server Actions and relationship-suggestion API.
- Staff still review and initiate every link or create action.
- No automatic matching, linking, merge, or profile creation was added.
- No production access, shared-QA access, record mutation during verification, migration, operational RLS change, communication, provider call, AI call, export, storage access, signed URL, certificate generation, sensitive flag change, or public trust claim occurred.
- The browser lock is same-screen exclusion, not durable idempotency or a database transaction.

## Rollback

Restore the prior component lookup and action-state handling. No data rollback or migration is required.

## Verification

- Focused relationship scope, Server Action, safe-link, safe-message, and component-boundary regression passed with 6 files and 25 tests.
- ESLint passed with no findings.
- All-file TypeScript checking passed.
- Production-gate validation passed with all 15 artifacts linked and sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- `git diff --check` passed; existing line-ending notices are informational only.
