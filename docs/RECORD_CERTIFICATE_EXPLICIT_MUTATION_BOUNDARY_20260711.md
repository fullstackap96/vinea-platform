# Record Certificate Explicit Mutation Boundary - 2026-07-11

Decision: `RECORD_CERTIFICATE_EXPLICIT_MUTATION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented locally; production-sensitive certificate expansion remains unapproved.

## What Changed

- Staff-triggered baptism certificate generation now uses a same-origin `POST` Route Handler.
- The certificate route no longer exports a `GET` handler, so link previews, crawlers, prefetching, and direct navigation cannot render a PDF or write an event.
- Both record-detail certificate controls use one client download component that posts with the authenticated staff session, opens the returned PDF, shows a preparing state, and returns one curated retry message on failure.
- The mutation rejects untrusted origins before route parameters, staff authentication, selected active-parish membership resolution, record reads, PDF rendering, or audit writes.
- The append-only `certificate_generated` event now returns only `id` and must be positively confirmed before the PDF response is delivered.
- A returned database error or accepted zero-row event insert returns the existing generic logging failure instead of an untracked certificate response.

## Preserved Authorization And Behavior

The route still requires:

1. authenticated staff;
2. selected active-parish membership when an active parish cookie is present;
3. a sacramental record owned by that resolved parish;
4. the existing baptism-only certificate boundary; and
5. successful PDF construction before the append-only `certificate_generated` event is written; and
6. positive persistence confirmation for that event before the PDF is returned.

The PDF remains `no-store`, uses the existing staff-reviewed register fields and template, and does not expose a service-role client, storage object, signed URL, or raw backend error.

## Verification Boundary

No certificate was generated and no event was written during automated verification. No production access, migration, operational RLS change, storage access, signed URL, communication send, AI call, Calendar call, automatic issuance, canonical decision, or public trust claim occurred.

### Automated Verification

- Focused certificate persistence, authorization, method-order, safe-error, and evidence suite: 4 files / 15 tests passed.
- Runtime coverage proves an accepted zero-row event insert returns generic failure and no PDF response.
- Source coverage requires event insert, minimal-id projection, single-row confirmation, matched-id validation, and only then PDF delivery.
- The latest full-suite, lint, build, handoff, and secret-scan results are recorded in `docs/VINEA_BUILD_STATUS.md`.
- All-file TypeScript check passed.
- Lint passed with zero errors and zero warnings.
- `git diff --check` passed; existing line-ending notices remain informational only.

## Rollback

Rollback is the scoped code reversal of the POST client control and Route Handler method. No database rollback is required because this slice adds no schema or data changes.
