# Daily Work Hub Server Aggregate Signals

Date: 2026-07-10

Status: Implemented and locally verified.

## Purpose

The Daily Work Hub previously loaded raw people, household, sacramental-record, and certificate-event rows in the browser to calculate read-only duplicate, continuity, certificate-readiness, reminder, and Parish Health signals. The same existing aggregate DTO is now built on the server and returned through `GET /api/dashboard/daily-operating-signals`.

## Authorization Boundary

- Staff authentication runs before parish resolution or signal reads.
- The httpOnly active-parish cookie takes precedence over the server-resolved browser hint.
- A supplied parish must resolve through exact active staff membership.
- Forged and cross-parish selections receive a generic not-found response before the loader runs.
- Primary-parish compatibility fallback remains available only when no selected parish signal exists.
- The route uses the authenticated read client and does not create a service-role client.

## Data-Minimization Boundary

The server loader selects only fields required by the existing deterministic signal builders:

- People: identity, name, email, phone, and date of birth fields used for duplicate scoring.
- Households: identity, name, street, city, and postal fields used for duplicate scoring.
- Sacramental records: identity, request link, type, display name, sacrament date, and register coordinates used for continuity/completion/certificate review.
- Certificate events: record identity and `certificate_generated` action only.

Notes, staff identities, event metadata, audit metadata, timestamps, storage data, documents, signed URLs, tokens, and raw source rows are not returned to the browser by this endpoint.

## Failure Behavior

- Missing active parish context returns empty signals without a database read.
- Individual source-query failures produce generic partial-data warnings.
- If certificate history cannot be verified, certificate-ready output is suppressed rather than presenting a potentially false staff action.
- The dashboard keeps its existing safe empty DTO and refresh guidance.

## Explicit Non-Goals

- No records are mutated.
- No communications are sent.
- No AI, export, storage, document, signed URL, Google Calendar, or external provider is called.
- No migration or operational RLS policy is added or changed.
- No production-sensitive feature flag or public trust claim is enabled or approved.

## Verification

- Loader tests cover minimal projections, exact parish filters, aggregate output, certificate-history failure behavior, and blank-context no-read behavior.
- Route tests cover authentication, exact membership scope, forged-parish denial, cookie precedence, compatibility fallback, authenticated read-client use, and absence of mutation/service-role paths.
- Client source tests prove raw signal-table reads and row parsers are absent from the browser component.
- Focused aggregate/release-evidence suite: 7 files / 24 tests passed.
- Full Vitest regression suite: 678 files / 2,674 tests passed.
- All-file TypeScript and quiet lint passed.
- Next.js `16.2.10` production build passed with the dynamic aggregate route and 54 static pages generated.
- Repository secret scan: 1,853 text files, 26 binaries skipped, and zero findings.
- Release handoff and completed local evidence checks passed with all production-sensitive approvals false.
