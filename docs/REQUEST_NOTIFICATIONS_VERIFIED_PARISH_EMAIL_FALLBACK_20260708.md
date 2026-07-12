# Request Notifications Verified-Parish Email Fallback - 2026-07-08

Status: Implemented as a safe multi-parish production-readiness hardening slice.

## Summary

The public request notification route now derives its database fallback notification inbox from the verified request contact's parish instead of the first parish row in the database.

## What Changed

- `verifyRequestNotificationPayload(...)` now returns the linked `parishId` after it validates the request type, contact name, contact email, and contact phone.
- `/api/request-notifications` now uses that verified `parishId` when loading `parishes.default_notification_email`.
- The route no longer uses a first-parish `created_at` fallback for the notification inbox.

## Safety Boundary

This does not send new categories of email, change rate limiting, apply migrations, change operational RLS, mutate records, enable production flags, call AI, run exports, access storage, create signed URLs, generate certificates, enable automation, touch Google Calendar data, or make public trust claims.

## Why This Matters

In a multi-parish deployment, an intake notification should not fall back to whichever parish was created first. This keeps public request notification routing aligned with the verified request's parish when `REQUEST_NOTIFICATION_TO_EMAIL` is not configured.

## Verification

- Focused route tests cover the verified-parish fallback behavior.
- Verifier tests cover returning `parishId` and failing closed when a request contact is not linked to a parish.
- Source guards prevent reintroducing the first-parish fallback pattern in this route.

## Remaining Follow-Up

- Optional non-production smoke can submit a safe public request with `REQUEST_NOTIFICATION_TO_EMAIL` unset and confirm the fallback inbox belongs to the request parish.
- Production email fallback behavior should still be reviewed before any multi-parish production rollout.
