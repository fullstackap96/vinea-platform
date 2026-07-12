# Health Endpoint Public Response Safety

Status: Implemented and verified. The public `/api/health` probe remains compatible with existing QA checks while production failure details are redacted and every response is explicitly uncacheable.

## Preserved Contract

- healthy responses remain HTTP `200`;
- unhealthy responses remain HTTP `503`;
- `ok` and the boolean `checks` map remain available;
- `checks.schema` remains available for approved deployment and smoke verification; and
- non-production failures may still include safe diagnostic labels for local/QA troubleshooting.

## Production Failure Boundary

When `NODE_ENV` is `production`, an unhealthy response:

- returns the generic error label `unhealthy`;
- does not expose required environment variable names;
- does not expose missing table, column, function, or schema labels; and
- does not include raw provider or database error messages.

## Cache Boundary

The Route Handler is explicitly dynamic and emits:

- `Cache-Control: no-store, max-age=0`
- `Pragma: no-cache`

Health responses therefore reflect the current deployment state instead of an intermediary or browser cache.

## Read-Only Schema Probe Boundary

The public-intake rate-limit RPC normally deletes expired buckets and inserts or updates the current bucket. Health now calls that RPC with an empty key, which the existing function rejects before any mutating statement. The readiness checker accepts only the expected PostgreSQL `P0001` validation code for this probe; missing-function errors remain missing-schema findings, and every other unexpected RPC error fails health.

## Database Deadline Boundary

The parish connectivity probe and every schema-readiness select/RPC share one eight-second `AbortSignal` budget. A stalled Supabase request therefore settles as an unhealthy result instead of holding the public probe until the hosting runtime terminates it. Production still receives only the generic `unhealthy` failure label; non-production may receive the safe `supabase-timeout` label. The deadline does not retry queries, mutate records, or weaken any authorization or RLS boundary.

## Safety Boundary

- production accessed: `NO`
- migrations applied: `NO`
- operational RLS changed: `NO`
- records mutated: `NO`
- production flags added or enabled: `NO`
- public trust claims approved: `NO`
