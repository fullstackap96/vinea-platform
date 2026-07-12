# Demo Request Provider Reliability

Status: Implemented as a public-form delivery reliability boundary. No real demo request or email was submitted during verification.

## What Changed

- The browser assigns one UUID delivery-attempt id to the exact reviewed form payload.
- A retry with unchanged fields reuses that id; changing any field creates a new attempt.
- The server validates the id, hashes it into an opaque Resend idempotency key, and never sends the raw id in the key.
- The Resend call has a 12-second confirmation deadline.
- Vinea still requires a non-empty provider message id before reporting success.
- Timeout and provider failures return the existing generic public guidance and write only safe server logs.

## Ordering and Safety

Durable rate limiting remains before bounded body parsing. Body parsing remains before validation, configuration lookup, email construction, and provider delivery. Same-origin mutation protection remains first. The recipient, sender, subject, body, Resend provider, and successful response contract are unchanged.

The attempt id is not authentication, authorization, a database identifier, or a production feature gate. It exists only to make uncertain same-payload retries safer.

## Boundaries

- Production deployment approved: `NO`
- Real email sent during verification: `NO`
- Production accessed: `NO`
- Migration or operational RLS change: `NO`
- Public trust claim approved: `NO`

This slice does not resolve the separate protected-preview configuration blocker. A fresh preview still requires the approved non-production `SUPABASE_SERVICE_ROLE_KEY` in Vercel Preview scope before `/api/health` and staff workspace smoke can pass.
