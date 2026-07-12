# Duplicate Review Explicit Projection Boundary - 2026-07-10

Decision: `DUPLICATE_REVIEW_EXPLICIT_PROJECTION_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented and verified locally without database writes or production access.

## Scope

People and Household duplicate review/merge lookups now use explicit row projections instead of `select('*')` for both candidate detection and the final two-row merge lookup.

## People Projection

The People route selects only the current `PersonRow` fields required by duplicate scoring, staff comparison, selected-field merge behavior, parishioner-link transfer, display order, and existing response shape:

- ids and parish ownership;
- parishioner link;
- name fields;
- email, phone, and date of birth;
- staff notes; and
- created/updated timestamps.

## Household Projection

The Household route selects only the current `HouseholdRow` fields required by duplicate scoring, staff comparison, selected-field merge behavior, display order, and existing response shape:

- ids and parish ownership;
- household name and address fields;
- staff notes; and
- created/updated timestamps.

These projections intentionally preserve the current UI and merge contract. The security improvement is that future schema columns cannot silently enter duplicate detection, serialization, or merge preparation.

## Preserved Boundaries

- Staff authentication and active-parish read/write context are unchanged.
- Exact parish filters still precede candidate and merge processing.
- Candidate scoring, 50-candidate response cap, 5,000-row scan cap, link/member counts, selected-field behavior, repointing, deletion, audit metadata, partial-failure behavior, and staff messages are unchanged.
- This slice does not change operational RLS or service-role strategy; it narrows the existing privileged read shape.
- No production access, database mutation, migration, feature flag, export, AI call, storage access, signed URL, Google Calendar call, certificate generation, or outbound communication occurred.

## Verification

Current verification:

- focused duplicate route and scoring suite: 4 files / 26 tests passed;
- focused duplicate plus release-evidence suite: 7 files / 35 tests passed;
- full Vitest regression suite: 698 files / 2,774 tests passed; and
- standard and all-file TypeScript checks passed;
- quiet lint passed;
- Next.js 16.2.10 production build passed with 56 static pages generated; and
- the source guards require both routes to use explicit projection constants and reject any reintroduced wildcard read.

## Manual QA Still Recommended

Use synthetic non-production People and Household fixtures to confirm the duplicate candidate cards, field comparison controls, link/member counts, and staff-reviewed merges remain unchanged. This local source/test evidence is not production merge evidence.
