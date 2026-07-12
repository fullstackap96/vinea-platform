# Family Portal Document Upload Durable Rate Limit

Status: Implemented and verified. The family document upload endpoint now applies durable abuse protection before token lookup, multipart parsing, storage access, metadata writes, or audit-event writes.

## Runtime Boundary

- limit: twenty attempts per client IP;
- window: fifteen minutes;
- key material: route label plus client IP only, never the raw family token;
- exceeded limit: HTTP `429` with a `Retry-After` header;
- limiter unavailable: generic HTTP `503` and no portal lookup or upload;
- invalid/expired token behavior remains generic after the limiter; and
- successful uploads still require an active family token, an allowed required family workflow step, and a file no larger than 10 MB.

## Privacy And Storage Boundary

Limiter logs contain only safe route labels and booleans. They do not contain raw portal tokens, token hashes, request ids, parish ids, storage paths, original filenames, signed URLs, or document contents.

## Safety Boundary

- successful family upload behavior changed: `NO`
- permitted document types changed: `NO`
- production flags added or enabled: `NO`
- migrations applied: `NO`
- operational RLS changed: `NO`
- storage accessed after limiter denial or failure: `NO`
- document metadata or audit event written after limiter denial or failure: `NO`
- public trust claims approved: `NO`
