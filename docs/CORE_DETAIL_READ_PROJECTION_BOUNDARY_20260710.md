# Core Detail Read Projection Boundary

Date: 2026-07-10

Status: Implemented and verified locally with synthetic mocks only.

## Scope

The selected-parish Person, Household, and Mass Intention detail loaders now use explicit primary-record projections, and embedded sacramental history uses a minimal shared summary contract.

## Implemented Boundary

- Person detail explicitly selects the complete current staff-visible person contract.
- Household detail explicitly selects the complete current staff-visible household contract.
- Mass Intention detail explicitly selects the complete current staff-visible intention contract.
- Sacramental history embedded in Person and Household detail contains only record id, type, person label, sacrament date, and creation time.
- Register notes, request/person relationship ids, minister/place/register references, staff ownership ids, and update timestamps do not enter embedded timeline/card summaries.
- Full Sacramental Record detail continues to use its explicit full register contract from a shared server projection module.
- Existing authentication, selected active-parish resolution, same-parish constraints, partial-data warnings, request/communication timelines, member rosters, edit forms, and safe errors remain unchanged.

## Verification

- Seven focused detail and selected-parish source test files passed with 21 tests.
- Tests assert exact primary and embedded-record projections and reject wildcard selection.
- TypeScript verification passed across full detail and summary DTO consumers.

## Safety And Rollback

- No production environment, database mutation, migration, RLS change, storage, certificate generation, or external service was used.
- Rollback is code-only by restoring the prior projections and embedded record type.
- Synthetic non-production browser QA should confirm all visible detail fields, edit-prefill behavior, timeline cards, parish switching, and cross-parish not-found states.

## Production Boundary

This data-minimization control does not approve production RLS, automated record decisions, certificate issuance, exports, or public trust claims.
