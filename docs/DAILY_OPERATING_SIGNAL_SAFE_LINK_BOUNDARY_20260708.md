# DAILY_OPERATING_SIGNAL_SAFE_LINK_BOUNDARY_20260708

Status: `READ-ONLY SIGNAL LINK HARDENING`

Date: 2026-07-08

## Purpose

Daily Operating Signal Inputs feed the Daily Work Hub, Parish Health Score, Operational Intelligence, and Workflow Reminder Preview. Their duplicate-review and certificate-ready links should remain staff dashboard review links only.

This boundary applies the shared `safeDashboardHrefOrFallback` utility to:

- certificate-ready record review links;
- duplicate person review links;
- duplicate household review links.

## Allowed Link Scope

Signal links may only resolve to staff dashboard paths that start with `/dashboard`.

Certificate-ready links fall back to `/dashboard/records` if the candidate link is unsafe.

Duplicate-review links fall back to `/dashboard/people` if the candidate link is unsafe.

## Forbidden Link Scope

Daily operating signal links must not expose:

- external URLs;
- protocol-relative URLs;
- JavaScript URLs;
- API routes;
- export routes;
- email/send routes;
- AI routes;
- storage paths;
- signed URLs;
- token material;
- raw metadata or raw export locations.

## Runtime Boundary

This slice only hardens read-only dashboard signal links. It does not mutate records, does not merge duplicates, does not issue certificates, does not send communications, does not enable automation, does not call AI, does not run exports, does not access storage, does not create signed URLs, does not apply migrations, does not change operational RLS, does not access production, does not make sacramental, canonical, pastoral, or eligibility decisions, and does not make public trust claims.
