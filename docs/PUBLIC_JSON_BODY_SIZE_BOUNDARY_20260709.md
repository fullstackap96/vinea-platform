# Public JSON Body Size Boundary

Status: `PUBLIC_JSON_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Purpose

Vinea now applies an application-level byte ceiling to the anonymous JSON POST routes that create public intake work or trigger public email workflows. This limits memory consumed by an individual request even when `Content-Length` is absent or misleading.

## Implemented Boundary

| Route | Maximum JSON body | Oversized response |
|---|---:|---|
| `/api/intake` | `64 KiB` | generic `413` |
| `/api/demo-request` | `32 KiB` | generic `413` |
| `/api/request-notifications` | `32 KiB` | generic `413` |

The shared reader lives in `lib/server/boundedJsonBody.ts`. It:

- rejects a valid declared `Content-Length` above the route limit before reading the body;
- streams and counts actual UTF-8 body bytes instead of trusting the header alone;
- cancels reading after the actual byte limit is crossed;
- returns only `invalid_json` or `too_large`, without logging or returning raw body content;
- keeps each route's existing malformed-JSON validation behavior.

## Required Ordering

Durable rate limiting remains before bounded body parsing on all three routes. Bounded parsing remains before validation, identity verification, parish resolution, database inserts, audit writes, or email delivery.

Oversized requests therefore do not:

- resolve public intake parish scope;
- create parishioners, requests, workflow rows, or audit events;
- verify request-notification identity;
- call the email provider.

## Safety Boundaries

- This update does not enable a production-sensitive feature flag.
- This update does not apply migrations or change operational RLS.
- This update does not access production or send a test communication.
- This update does not change valid public form payloads.
- This update does not approve public intake routing for production.
- This update does not make a public trust-center claim.

## Verification

Focused tests cover declared-size rejection, streamed byte counting, malformed headers, invalid JSON, route ordering, generic `413` responses, and downstream no-call behavior. Source guards also prohibit direct `request.json()` use in the three protected routes.

## Plain-English Summary

Public forms can still submit normal requests, but Vinea now stops abnormally large JSON submissions before they can consume unnecessary server memory or reach database and email work.
