# Staff Communication Same-Origin Mutation Boundary - 2026-07-10

Decision: `STAFF_COMMUNICATION_SAME_ORIGIN_MUTATION_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented and verified locally without production access or outbound communication.

## Scope

The following cookie-authenticated staff mutations now call the shared `rejectCrossOriginMutation(...)` guard before authentication, body parsing, privileged reads, provider construction, audit writes, or operational writes:

- `POST /api/email/send`
- `POST /api/requests/[id]/communications`
- `PATCH /api/requests/[id]/communications`
- `POST /api/requests/[id]/mark-contacted`
- `POST /api/requests/[id]/care-touchpoint`

The guard requires a valid `Origin` that exactly matches the request origin, configured Vinea app origin, or current Vercel deployment origin. If `Sec-Fetch-Site` is present, it must be `same-origin`. Missing, malformed, opaque `null`, cross-origin, same-site sibling, and cross-site requests receive the same `403` response with `Invalid request.` and cannot reach authentication or service-role access.

Read-only communication history `GET` behavior is unchanged.

## Preserved Staff Behavior

- Staff still enter and review subjects, message bodies, communication notes, follow-up dates, and care-touchpoint details.
- Email delivery still derives the recipient from the stored same-parish request relationship.
- Existing active-parish membership and same-parish request ownership checks remain required after the origin check.
- Existing bounded-body validation, safe audit metadata, partial-success guidance, provider behavior, and rollback/no-op paths remain unchanged.

## Verification

- Unit coverage validates exact same-origin, configured app origin, and Vercel preview origin success.
- Unit coverage rejects missing, malformed, opaque, cross-origin, and cross-site signals generically.
- Route tests prove forged origins stop before staff authentication, request lookup, privileged client creation, provider construction, or writes.
- Source guards require the origin check before authentication and parsing on every scoped mutation and preserve the read-only GET route.
- Focused helper, route, source-guard, and release-evidence suite: 8 files / 53 tests passed.
- Full Vitest regression suite: 704 files / 2,809 tests passed.
- All-file TypeScript and ESLint checks pass with zero warnings.
- Next.js `16.2.10` production build passes with all 56 static pages generated.
- Release handoff reconciles all 106 artifacts while all 15 production-sensitive gates remain locked.
- Repository secret scan checks 1,920 files with zero findings.
- No communication was sent during verification.

## Preserved Boundaries

- No production access.
- No migration or operational RLS change.
- No Google Calendar, AI, export, storage, signed URL, certificate, or automation action.
- No production-sensitive flag or public trust claim.
