# AI Provider Deadline Boundary

Status: Implemented as transport reliability hardening for staff AI summary and reply generation. No OpenAI request was made during verification.

## Contract

Every current `openai.responses.create` call in `/api/ai/summary` and `/api/ai/reply` receives a server-owned `AbortSignal.timeout(30_000)` request option. A stalled provider request now settles through the route's existing generic unavailable response instead of holding the staff action indefinitely.

The boundary covers:

- the legacy staff-gated summary path;
- the approved-gate safety-chain summary generation path; and
- the legacy staff-gated reply-draft path.

## Preserved Safety

Authentication, bounded body parsing, active-parish and request scope, feature gates, audit-write ordering, safe response exposure, source display, staff review status, prompts, model choice, provider, and generic error handling are unchanged. The deadline does not enable any AI feature or bypass an approval gate.

AI remains assistive, staff-reviewed, permission-aware, and prohibited from making canonical, sacramental, pastoral, or eligibility decisions.

## Production Boundary

- Production AI flags enabled: `NO`
- OpenAI called during verification: `NO`
- Production accessed: `NO`
- Migration or operational RLS change: `NO`
- Customer-facing AI approved: `NO`
- Public trust claim approved: `NO`
