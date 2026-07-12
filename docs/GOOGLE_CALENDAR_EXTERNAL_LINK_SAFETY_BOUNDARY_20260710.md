# Google Calendar External Link Safety Boundary

Decision: `GOOGLE_CALENDAR_EXTERNAL_LINK_SAFETY_IMPLEMENTED_20260710`

Status: `IMPLEMENTED - HTTPS GOOGLE EVENT LINKS ONLY`

Date: 2026-07-10

## Scope

Request Detail now validates saved Google Calendar event links and conflict event links before rendering them as external anchors.

Only credential-free HTTPS links on `calendar.google.com` or `www.google.com`, using the standard HTTPS port, are rendered. Malformed links, non-HTTPS schemes, credential-bearing URLs, alternate ports, deceptive host suffixes, and non-Google hosts are hidden.

## Preserved Behavior

- Google OAuth and selected-parish integration lookup are unchanged.
- Calendar event create, update, delete, conflict lookup, and database persistence behavior are unchanged.
- Valid provider event links continue opening in a new tab with `noopener noreferrer` protection.
- No Google API call or calendar/database mutation occurs during verification.

## Verification Boundary

- Focused helper/source tests cover valid Google event hosts plus protocol, host, credential, port, and malformed-link rejection.
- No production environment is accessed.
- No migration, operational RLS change, production flag, external send, record mutation, AI call, export, storage access, signed URL, certificate generation, or public trust claim is made.

Production-sensitive features approved by this boundary: `NO`.

Public trust claims approved by this boundary: `NO`.

## Verification Results

- Integrated dashboard-shell, Calendar-link, and release-evidence suite: `11 test files / 30 tests passed`.
- Full Vitest regression suite: `669 test files / 2,635 tests passed`.
- All-file TypeScript and quiet lint: `PASS`.
- Repository secret scan: `1,825 text files / 26 binaries skipped / 0 findings`; matched values printed: `NO`.
- Release handoff validation: `70 artifacts / 16 CI commands / 15 locked gates / 0 findings`.
- Completed local evidence validation: `430 required phrases / 0 findings`.
- Next.js production build: `PASS` with Next.js `16.2.10` and all `53` static pages generated.
