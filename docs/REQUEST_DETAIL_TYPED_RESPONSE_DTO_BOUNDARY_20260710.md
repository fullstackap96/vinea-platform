# Request Detail Typed Response DTO Boundary - 2026-07-10

Decision: `REQUEST_DETAIL_TYPED_RESPONSE_DTO_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented in repository code and verified locally without production access.

## Scope

The staff Request Detail screen now uses a shared, allowlisted DTO boundary for its core read model instead of storing open-ended API JSON in `any` state. `lib/requestDetailDtos.ts` owns the current contracts and parsers for:

- active-parish request access and the request/parishioner identity;
- legacy workflow checklist items;
- communication history;
- Funeral, Wedding, OCIA, and Join Parish Catholic type-specific details; and
- the linked sacramental record continuity summary.

## Safety Behavior

The access parser requires a stable request id and parish id, confirms the response request matches both, and rejects a parishioner whose parish does not match the authorized response parish. This is defense in depth after the server's active-parish request access authorization; it does not replace authentication, membership checks, request ownership, or operational RLS.

Array parsers fail the whole checklist or communication collection when a required row field is malformed. Type-support parsing fails closed when a non-null detail or linked-record object does not satisfy its minimal contract. The DTO boundary drops unexpected future fields rather than forwarding them into staff-facing state.

The page includes an explicit generic fallback for the impossible state where access succeeds but no validated request is available. It does not render raw payloads, database messages, request ids, parish ids, or private response objects.

## Staff Experience

Existing request overview, contact, intake, workflow, communication, scheduling, Calendar, record-continuity, AI scaffold, and staff-review behavior is preserved. This change does not alter request mutations or introduce new controls. It makes the screen's data contract precise and removes all remaining explicit `any` lint warnings from Request Detail and its formerly loose header/checklist components.

## Verification

- DTO unit tests cover allowlisting, normalization, cross-parish response mismatch, malformed collections, Catholic detail filtering, and linked-record filtering.
- Source tests require every core response parser and prohibit explicit `any` in the Request Detail page, header, and checklist components.
- Focused DTO, server/client boundary, and release-evidence suite: 6 files / 21 tests passed.
- Full Vitest regression suite: 702 files / 2,796 tests passed.
- All-file TypeScript checks pass.
- ESLint passes with zero errors and zero warnings.
- Dependency security audit passes with zero vulnerabilities.
- Next.js `16.2.10` production build passes with all 56 static pages generated.
- Release handoff reconciles all 105 artifacts while all 15 production-sensitive gates remain locked.

## Preserved Boundaries

- No production access.
- No database mutation or external provider call.
- No migration or operational RLS change.
- No communication send, AI call, export, storage access, signed URL, Google Calendar call, certificate generation, or automation.
- No production-sensitive flag or public trust claim.
