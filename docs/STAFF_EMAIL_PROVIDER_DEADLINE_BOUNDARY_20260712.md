# Staff Email Provider Deadline Boundary

Decision: `STAFF_EMAIL_PROVIDER_DEADLINE_BOUNDARY_IMPLEMENTED_20260712`

Status: Implemented and verified locally for request-bound staff email delivery.

## What Changed

Request Detail and the Daily Work Hub now create a browser delivery-attempt UUID before calling `/api/email/send`. The server requires that identifier after staff authentication and bounded body parsing but before active-parish request lookup or provider access. It combines the attempt with the authorized stored request identity through SHA-256, so Resend receives an opaque idempotency key rather than a raw request or attempt identifier.

The provider request now owns a 12-second abort signal. A provider acknowledgement with a non-empty message id remains the only successful delivery result. If the deadline expires without that confirmation, Vinea returns a safe `uncertain` result and tells staff that delivery could not be confirmed and to check with the recipient before trying again. It does not write the sent-email audit event or communication history for an unconfirmed result.

Each browser caller retains the attempt only for the exact same staff-reviewed content. A retry with unchanged request, subject, and body reuses the provider idempotency key; edited content creates a new attempt. Definitive provider rejection clears the attempt, while network or timeout uncertainty preserves it.

## Why This Matters

A slow email provider can no longer keep a Vinea request open indefinitely or encourage a blind retry that may send a duplicate message. Staff receive honest recovery guidance, while a same-content retry has a provider-level duplicate-suppression key.

## Preserved Boundaries

- Staff authentication, selected active-parish membership, same-parish request ownership, and stored-recipient derivation remain authoritative.
- Subject and body remain staff-entered and staff-reviewed.
- Provider message-id confirmation remains required before audit or success.
- Post-send communication logging still uses the authenticated active-parish communications API.
- No real email was sent during verification.
- No production access, deployment, migration, operational RLS change, record mutation, production flag enablement, external account access, or public trust claim occurred.

## Limitation And Rollback

This is provider request idempotency, not a durable Vinea delivery ledger. The provider controls its idempotency retention window, and an unconfirmed outcome still requires staff review. Rollback removes the attempt field, provider request options, and uncertainty handling; no database or data rollback is required.

## Verification

- Helper tests validate UUID acceptance, deterministic opaque keys, and bounded signal behavior.
- Route and source tests validate authorization/order, provider confirmation, timeout-before-audit behavior, exact-content attempt reuse, safe uncertainty guidance, and no browser recipient authority.
- All provider calls remain mocked in automated tests.
