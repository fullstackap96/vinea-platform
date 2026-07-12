# Daily Brief Provider Reliability

Status: Implemented as staff-reviewed and scheduled email-delivery reliability hardening. No real Daily Brief email was sent during verification.

## Reliability Contract

- Each confirmed manual send owns a browser-generated UUID attempt id scoped to the selected parish.
- An uncertain same-parish retry reuses that id, allowing Vinea to retry delivery-state recording without requesting a second provider send.
- A completed manual send clears the attempt so a later explicit staff action remains a new send.
- Scheduled delivery uses an opaque parish-and-date idempotency key, so a retry for the same parish/day does not create a duplicate brief.
- Every Resend call has a 12-second confirmation deadline and still requires a non-empty provider message id.

## Preserved Boundaries

Staff confirmation, same-origin protection, authentication, selected active-parish membership, parish-owned recipient derivation, cron authorization, safe error logging, partial-success guidance, and delivery-state confirmation remain in place. Manual body parsing is bounded to 4 KiB and occurs only after staff authentication.

No recipient, subject, body, schedule, provider, database schema, migration, operational RLS rule, production flag, or public trust claim changed.

## Production Boundary

- Production deployment approved: `NO`
- Real email sent during verification: `NO`
- Production accessed: `NO`
- Migration or operational RLS change: `NO`
- Public trust claim approved: `NO`
