# Request Notifications Durable Rate Limit

Status: Implemented and verified. The public `/api/request-notifications` email route now uses Vinea's durable database-backed rate limiter instead of process-local memory.

## Runtime Boundary

- limit: ten attempts per client IP;
- window: one minute;
- exceeded limit: HTTP `429` with a `Retry-After` header;
- limiter unavailable: generic HTTP `503` and no payload verification or email delivery;
- limiter runs before body parsing, request/contact verification, parish email lookup, email construction, or Resend; and
- missing legacy rate-limit schema continues through the existing in-memory compatibility fallback in `checkDurableRateLimit`.

The existing request identity verification remains required after the limiter. A caller still cannot send a notification unless request type and stored contact identity match the saved request.

## Public Response Boundary

Responses do not expose database errors, provider payloads, API keys, recipient addresses, sender addresses, request ids, or contact data. Unexpected limiter failures use the shared redacted server logger.

## Safety Boundary

- successful notification behavior changed: `NO`
- verified-parish recipient selection changed: `NO`
- production flags added or enabled: `NO`
- migrations applied: `NO`
- operational RLS changed: `NO`
- records mutated outside the existing durable rate-limit bucket: `NO`
- email sent after limiter denial or failure: `NO`
- public trust claims approved: `NO`
