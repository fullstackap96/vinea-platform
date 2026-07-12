# Request-Bound Staff Email Authorization

Decision: `EMAIL_SEND_REQUEST_PARISH_AUTHORIZATION_IMPLEMENTED_20260710`

Status: `IMPLEMENTED - REQUEST AND ACTIVE-PARISH AUTHORIZATION REQUIRED`

Date: 2026-07-10

## Boundary

`POST /api/email/send` now requires a `requestId` and preserves staff-entered `subject` and `text`. The route authenticates the staff session, reads the selected active-parish cookie, verifies exact parish membership and same-parish request ownership, then derives the recipient from the request's stored parishioner relationship.

The browser no longer controls the delivered recipient. A supplied `to` field is ignored. Forged active-parish cookies, cross-parish request ids, missing relationships, and invalid stored addresses stop before Resend is constructed or called. Cross-parish and forged-request failures use the generic `Request not found.` response.

Primary-parish fallback remains explicit and is allowed only when no active-parish cookie exists, matching the existing approved compatibility behavior.

## Staff Callers

- Request Detail sends `requestId`, `subject`, and `text`, then logs the successful send through `POST /api/requests/[id]/communications`.
- Daily Work Hub sends the same request-bound payload and now uses the same active-parish-aware communications route after delivery.
- The Daily Work Hub no longer inserts `request_communications` or updates request communication summaries directly from the browser in the email-send path.

## Verification Boundary

- Provider delivery is mocked in automated tests; no real email is sent.
- Focused tests cover stored-recipient delivery, forged-recipient rejection, active-parish request denial, missing request ids, invalid stored recipients, server ordering, both caller payloads, and scoped post-send logging.
- Full Vitest passed: `659` files / `2,593` tests.
- All-file TypeScript and quiet lint passed.
- Next.js `16.2.10` production build passed with `53` static pages generated.
- Release handoff passed with `64` artifacts, `16` CI commands, `15` locked gates, and zero findings.
- Completed local evidence passed with `359` required phrases and zero findings.
- Repository secret scan passed across `1,805` text files with zero findings and no matched values printed.
- No production environment is accessed.
- No migration or operational RLS change is made.
- No production-sensitive flag is enabled or added.

## Remaining Risk

Email delivery and communication logging remain separate operations. If delivery succeeds but communication logging fails, staff receive the existing review-before-resend warning. A future outbox/idempotency design would require a separate product and data-model decision.

Production-sensitive features approved by this boundary: `NO`.

Public trust claims approved by this boundary: `NO`.
