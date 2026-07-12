# Request Mutation Same-Origin Boundary - 2026-07-10

Decision: `REQUEST_MUTATION_SAME_ORIGIN_BOUNDARY_IMPLEMENTED_20260710`

Status: Implemented and verified locally without production access.

## Scope

Vinea now applies the shared fail-closed origin guard to all 18 browser-driven request mutation Route Handlers before authentication, body parsing, service-role access, storage access, provider construction, audit writes, or operational writes.

Protected workflows include:

- AI summary and reply-draft persistence;
- internal staff notes and suggested dates;
- checklist completion;
- communication history, follow-up, mark-as-contacted, and care touchpoints;
- confirmed Baptism, Funeral, Wedding, and OCIA schedules;
- Funeral and Wedding pastoral detail review;
- intake quick triage;
- document upload and review;
- family portal token creation.

Read-only request, communication, document, workflow, type-support, and relationship-suggestion GET handlers remain unchanged.

## Authorization Order

Every protected route now follows this order:

1. Reject missing, malformed, opaque, cross-origin, or cross-site browser origin metadata.
2. Require authenticated staff.
3. Require selected active-parish membership and same-parish request ownership through the existing access loaders.
4. Validate bounded staff input and target ownership.
5. Perform only the route's existing approved write, audit, storage, or provider behavior.

The origin guard supplements active-parish membership and same-parish request ownership. It does not replace either control or operational RLS.

## Verification

- Focused request-mutation, body-boundary, authorization, source-guard, and release-evidence suite: 10 files / 59 tests passed.
- Full Vitest regression suite: 705 files / 2,829 tests passed.
- All-file TypeScript and ESLint checks pass with zero warnings.
- Next.js `16.2.10` production build passes with all 56 static pages generated.
- Release handoff reconciles all 107 artifacts while all 15 production-sensitive gates remain locked.
- Repository secret scan checks 1,922 files with zero findings.

## Preserved Boundaries

- No production access.
- No migration or operational RLS change.
- No communication send, provider call, storage operation, signed URL creation, AI call, Calendar call, export, certificate generation, or automation occurred during verification.
- No production-sensitive flag or public trust claim.
