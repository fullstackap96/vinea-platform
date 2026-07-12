# Demo Request Durable Rate Limit

Status: Implemented and verified. The public `/api/demo-request` email route now uses Vinea's durable database-backed rate limiter before parsing the request body or calling the email provider.

## Runtime Boundary

- limit: five attempts per client IP;
- window: fifteen minutes;
- exceeded limit: HTTP `429` with a `Retry-After` header;
- limiter unavailable: generic HTTP `503` and no email delivery;
- limiter runs before body parsing, validation, email construction, or Resend; and
- missing legacy rate-limit schema continues through the existing in-memory compatibility fallback in `checkDurableRateLimit`.

## Public Response Boundary

Responses do not expose database errors, provider payloads, API keys, recipient addresses, sender addresses, or submitted contact data. Unexpected limiter failures use the shared redacted server logger.

## Safety Boundary

- successful demo-request behavior changed: `NO`
- production flags added or enabled: `NO`
- migrations applied: `NO`
- operational RLS changed: `NO`
- records mutated outside the existing durable rate-limit bucket: `NO`
- email sent after limiter denial or failure: `NO`
- public trust claims approved: `NO`
