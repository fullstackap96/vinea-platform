# Core Record Action Active-Parish Fallback Boundary

Status: `IMPLEMENTED AND LOCALLY VERIFIED; SAFE NON-PRODUCTION BROWSER QA RECOMMENDED`

Date: 2026-07-10

## Purpose

Make People, Households, Mass Intentions, and Sacramental Record Server Actions fail closed when staff have explicitly selected an active parish. Legacy primary-parish compatibility remains available only when no active-parish cookie exists.

## Implemented Boundary

- People create/update actions pass `allowPrimaryParishFallback: false` whenever an active parish cookie is present.
- Household create/update/member actions resolve through the same cookie-sensitive write context.
- Mass Intention create/update actions disable primary fallback for selected-parish writes.
- Sacramental Record create/update/person-link actions disable primary fallback for selected-parish writes.
- Cookie-less legacy single-parish flows continue to opt into the existing primary-parish compatibility fallback.
- Existing selected-parish row constraints, validation, safe messages, request/person relationship checks, and staff-reviewed workflows remain unchanged.

## Why This Is Safer

An explicit parish selection is an authorization decision, not a hint. If membership lookup for that selected parish fails, Vinea now denies the write instead of attempting to reinterpret it through the legacy primary parish. This removes an ambiguity that could otherwise hide deployment or membership drift.

## Explicit Boundaries

- Production accessed: `NO`.
- Migration or operational RLS changed: `NO`.
- Existing records mutated during verification: `NO`.
- Communication sent: `NO`.
- Google Calendar or another provider called: `NO`.
- Production-sensitive flag enabled: `NO`.
- Canonical, sacramental, pastoral, or eligibility decision added: `NO`.
- Public trust claim approved: `NO`.

## Verification

- Focused core action fallback suite: `5 files / 34 tests passed`.
- Source guard requires cookie-sensitive fallback in all four action modules and rejects unconditional fallback.
- Focused fallback plus release-evidence suite: `8 files / 43 tests passed`.
- Full Vitest regression suite: `694 files / 2,755 tests passed`.
- Standard and all-file TypeScript checks: `PASS`.
- Quiet lint: `PASS`.
- Next.js `16.2.10` production build: `PASS`, with `56` static pages generated.
- Repository secret scan: `1,886` text files scanned, `26` binaries skipped, `0` findings, and no secret values printed.
- Release handoff: `87` artifacts, `16` CI commands, `15` locked gates, and `0` findings.
- Completed local evidence: `510` required phrases and `0` findings.
- Production gate check: `15` gates remain locked and `0` findings.
- `git diff --check`: `PASS`; existing line-ending warnings only.

## Manual Follow-Up

In safe non-production, switch between two authorized parishes and verify create/update operations target the selected parish for People, Households, Mass Intentions, and Sacramental Records. Then use a stale or unauthorized active-parish cookie and verify each operation fails without writing. Finally, clear the cookie and confirm the approved legacy single-parish fallback still works where intentionally supported.
