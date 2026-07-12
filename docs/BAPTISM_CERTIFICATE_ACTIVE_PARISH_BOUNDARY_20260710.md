# Baptism Certificate Active-Parish Boundary - 2026-07-10

Decision: `BAPTISM_CERTIFICATE_ACTIVE_PARISH_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented and verified locally with synthetic mocks only. No certificate was generated against a real environment.

## Scope

The existing staff-reviewed baptism certificate route now requires an authorized staff session, resolves the selected active parish, verifies exact membership when an active parish cookie is present, and constrains the sacramental record lookup to that parish before PDF or event work.

The route keeps explicit no-cookie primary membership fallback for legacy single-parish compatibility. A stale, forged, or unauthorized active parish cookie cannot fall through to a different parish.

## Data Boundary

The sacramental record query now selects only:

- record id and parish id;
- record type and person name;
- sacrament date, place, and minister; and
- register book, page, and line.

It no longer loads request/person links, notes, audit identities, or timestamps for certificate generation. The parish display name is loaded through the authenticated staff client instead of a service-role client.

## Write And Failure Order

After authorization and same-parish record lookup, the route:

1. confirms the existing Baptism-only boundary;
2. loads the selected parish display name;
3. builds the existing PDF in memory;
4. writes the existing `certificate_generated` event using the selected parish and authenticated staff identity; and
5. returns the no-store inline PDF response.

If PDF construction fails, no certificate event is written. If event logging fails, the PDF is not delivered and staff receive the existing safe error. This prevents a failed generation attempt from being recorded as a completed certificate.

## Preserved Behavior And Exclusions

- Certificate generation remains a staff-clicked, staff-reviewed action.
- Only Baptism records are supported.
- The PDF template, filename behavior, event action, event metadata, response headers, and safe staff messages remain unchanged.
- Vinea does not decide sacramental eligibility, canonical status, pastoral readiness, or whether a certificate should be issued.
- No certificate is generated automatically.
- No production access, migration, operational RLS change, feature flag, storage access, signed URL, export, AI call, Google Calendar call, or outbound communication was used.

## Verification

Focused tests prove:

- unauthenticated requests stop before parish resolution or database work;
- forged active-parish selection returns generic not-found guidance before record/PDF/event work;
- record lookup is constrained by both record id and selected parish id;
- only the fields consumed by the existing PDF are selected;
- the service-role client is absent;
- PDF generation precedes event insertion on success; and
- PDF failure writes no event.

Current verification:

- focused certificate authorization, PDF, and safe-error suite: 3 files / 11 tests passed;
- focused certificate plus release-evidence suite: 6 files / 20 tests passed;
- full Vitest regression suite: 698 files / 2,774 tests passed;
- standard and all-file TypeScript checks passed;
- quiet lint passed; and
- Next.js 16.2.10 production build passed with 56 static pages generated.

## Manual QA Still Recommended

Use a synthetic non-production Baptism record in an approved parish to verify the PDF opens, the selected parish name appears, exactly one event is recorded, a cross-parish id returns generic not-found guidance, and switching back to the authorized parish restores access. This source/runtime-mock evidence is not production rollout evidence.
