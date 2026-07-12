# Daily Work Hub Reply Draft Active-Parish Route - 2026-07-10

Decision: `DAILY_WORK_HUB_REPLY_DRAFT_ACTIVE_PARISH_ROUTE_IMPLEMENTED_20260710`

Status: Implemented and verified without calling OpenAI, sending communications, or accessing production.

## Change

Daily Work Hub follow-up draft generation still uses the existing staff-reviewed AI reply flow. After a draft is returned, `app/dashboard/DashboardPageCore.tsx` now persists it through:

`PATCH /api/requests/[id]/reply-draft`

The browser no longer updates `requests.reply_draft` directly.

## Preserved Authorization And Behavior

The existing reply-draft route:

- requires an authenticated authorized staff session;
- reads the active parish cookie;
- validates active-parish request ownership through `loadStaffScopedRequestDetailAccess(...)`;
- uses the explicit compatibility fallback only when no active parish cookie exists;
- accepts a bounded JSON body;
- writes only `requests.reply_draft` for the authorized request id; and
- returns generic not-found or safe update guidance for unauthorized, forged, or cross-parish targets.

The Daily Work Hub preserves the generated reply text, individual draft behavior, batch draft behavior, staff review before send, safe client error messages, and the existing email provider path. This slice does not change `/api/ai/reply` or its safety gates.

## Verification Boundary

Focused source tests prove that both Request Detail and Daily Work Hub call the scoped reply-draft route and that the Daily Work Hub draft block contains no direct browser `requests` update.

No OpenAI call, email send, database write, Google Calendar call, export, storage access, signed URL, migration, operational RLS change, production access, or production-sensitive flag was used during verification.

## Rollback

Rollback is code-only: restore the prior caller. No schema, data, RLS, feature-flag, or provider rollback is required. Production-sensitive features remain `NO-GO` unless separately approved.
