# Core Directory List Projection Boundary

Date: 2026-07-10

Status: Implemented and verified locally with synthetic mocks only.

## Scope

The selected-parish People, Households, and Mass Intentions list loaders now use minimal view-specific DTOs and explicit database projections.

## Implemented Boundary

- People list rows contain only id, display-name parts, email, phone, and the separately loaded primary-household label.
- Household list rows contain only id, name, address components, and the separately counted member total.
- Mass Intention list rows contain only id, requester, intention text, schedule/assignment fields, stipend state, and fulfillment state.
- People birth dates, notes, parishioner links, parish ids, and timestamps no longer enter the People list.
- Household notes and timestamps no longer enter the Household list.
- Mass Intention notes, parish ids, and timestamps no longer enter the Mass Intentions list.
- Existing staff authentication, selected active-parish resolution, search/filter behavior, ordering, household enrichment, member counts, safe errors, and navigation remain unchanged.

## Verification

- Six focused loader and selected-parish UI test files passed with 18 tests.
- Tests assert each exact projection and reject wildcard selection or forbidden list fields.
- TypeScript verification passed with list-specific DTOs rather than incomplete full-row types.

## Safety And Rollback

- No database, production environment, external service, record mutation, migration, or RLS change was used.
- Rollback is code-only by restoring the prior list row contracts and projections.
- Synthetic non-production browser QA should confirm search, labels, counts, filtering, and parish switching before deployment evidence is claimed.

## Production Boundary

This data-minimization control does not approve production RLS, exports, public trust claims, automated communication, or other gated capabilities.
