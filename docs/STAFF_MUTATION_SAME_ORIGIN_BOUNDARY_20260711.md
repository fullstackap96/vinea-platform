# Staff Mutation Same-Origin Boundary - 2026-07-11

Decision: `STAFF_MUTATION_SAME_ORIGIN_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without production access or external provider calls.

## Scope

The shared fail-closed browser-origin guard now protects 18 staff-only mutation methods across 16 Route Handler files before authentication, parsing, privileged reads, provider construction, or writes.

The protected cohort covers:

- AI generation routes for summaries and reply drafts;
- generic audit-event writes;
- Google Calendar event lifecycle create, update, and delete;
- People and Household duplicate merges;
- committed data imports;
- Mass Intention intake triage;
- manual Parish Daily Brief delivery;
- Public Intake Routing metadata, domain, verification, and token administration;
- parish settings;
- staff access administration;
- workflow-template updates;
- staff-triggered baptism certificate generation.

Together these form the reviewed parish administration and staff integration mutation surface.

Together with the request mutation boundary, every reviewed browser-authenticated POST/PATCH Route Handler now rejects an untrusted origin before staff authorization or privileged work.

A repository-wide discovery guard now scans every `app/api/**/route.ts` mutation method. Mutations that directly call `requireStaffFromRequest(request)` or `.auth.getUser()` must reject an untrusted origin before that authentication call. This catches newly added direct-auth staff routes even when they have not yet been added to a named cohort list.

## Cohort Boundary

Public and token-scoped mutation routes remain outside this staff-authenticated cohort because they do not use staff authentication:

- public intake;
- demo requests;
- request notifications;
- family portal document upload.

Those first-party browser routes are now also protected by the shared origin guard under the later all-API mutation boundary. They retain their existing durable rate limits, request/token verification, bounded parsing, and other route-specific controls; they are not reclassified as staff routes.

Parish Daily Brief keeps its two transport boundaries separate: authenticated manual delivery uses guarded `POST`, while bearer-authorized cron delivery remains on `GET` and does not require browser origin headers.

The repository-wide discovery guard does not replace route-specific authorization tests. Routes that delegate authentication to another helper still require their focused source and behavior coverage, while webhook and scheduled transports retain purpose-built controls.

## Preserved Boundaries

- Existing staff authentication, selected active-parish membership, admin/role requirements, target ownership, validation, safe audit metadata, and generic denial behavior remain intact.
- Existing AI, Google Calendar, import, duplicate merge, and administration behavior is unchanged after the new first gate.
- No provider call, Calendar mutation, AI call, import, merge, audit write, or administration write occurred during verification.
- No production access, migration, operational RLS change, production-sensitive flag, or public trust claim.

## Verification

- The source guard covers all 16 reviewed route files and all 18 protected mutation methods.
- Focused automatic-discovery and named mutation-boundary suite: 5 files / 50 tests passed.
- Full Vitest regression suite: 708 files / 2,855 tests passed.
- All-file TypeScript check passed.
- Lint passed with zero errors and zero warnings.
- Next.js `16.2.10` production build passed with all 56 static pages generated.
- Release handoff reconciled all 109 artifacts while all 15 production-sensitive gates remained locked.
- Repository secret scan checked 1,928 files with zero findings.
- `git diff --check` passed; existing line-ending notices remain informational only.
