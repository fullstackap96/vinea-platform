# Daily Work Hub Active-Parish Request Mutation Approval Revalidation

Decision: `DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APPROVAL_REVALIDATED_20260711`

Status: The approved production-readiness boundary is implemented and revalidated locally.

## Confirmed Runtime Boundary

- Mark as contacted calls `POST /api/requests/[id]/mark-contacted`.
- Funeral care touchpoints call `POST /api/requests/[id]/care-touchpoint`.
- Both routes require same-origin mutation metadata and authenticated staff before privileged access.
- The selected active parish cookie is authoritative when present. A server-rendered parish header is considered only when the cookie is absent, and that exact parish still must pass membership validation.
- Both routes require same-parish request ownership with primary-parish fallback disabled.
- Care touchpoints additionally require the owned request to be a funeral request.
- Forged, cross-parish, stale, wrong-type, or missing-scope targets receive generic `Request not found.` guidance before any write.
- The regression suite now explicitly proves both actions fail closed when the selected active-parish scope is absent.

## Staff-Reviewed Persistence

The routes preserve current staff-entered care method, notes, follow-up date, and care-cycle decision. Mark as contacted retains its server-owned follow-up queue label. Communication history, request summary, and funeral follow-up writes remain ordered on the server, with safe note-free audit metadata and existing partial-success guidance if a later write fails.

The Daily Work Hub has no direct browser Supabase mutations for `request_communications`, `requests`, or `funeral_request_details`. Immediate caller locks remain same-screen duplicate-dispatch protection only; they do not claim durable idempotency or transactional rollback.

## Preserved Boundaries

- No production access.
- No communication was sent.
- No Google Calendar or external provider call.
- No migration or operational RLS change.
- No production-sensitive flag enabled.
- No record mutation occurred during verification.
- Existing staff review, validation, audit metadata, partial-success guidance, and code-only rollback/no-op behavior remain unchanged.

## Verification

- Five focused route, same-origin, persistence-order, and caller-integrity files passed with 63 tests.
- ESLint passed with no findings.
- All-file TypeScript checking passed.
- Production-gate validation passed with all 15 artifacts linked and production-sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- `git diff --check` passed; existing line-ending notices are informational only.
