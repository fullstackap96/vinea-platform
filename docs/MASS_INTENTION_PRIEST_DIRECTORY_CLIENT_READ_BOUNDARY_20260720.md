# Mass Intention Priest Directory Client Read Boundary

Completion marker: `MASS_INTENTION_PRIEST_DIRECTORY_CLIENT_READ_BOUNDARY_IMPLEMENTED_20260720`

## Staff Outcome

The New and Edit Mass Intention forms now populate their celebrant suggestions from the validated parish settings response. The clients previously looked for `priest_names` at the response root even though the authorized API returns it under `parish.priest_names`, so configured priests were silently absent.

Both optional reads now also stop waiting after 15 seconds. A failed, malformed, or timed-out directory read leaves the existing free-text priest field available rather than blocking Mass Intention work.

## Preserved Boundaries

- Both clients still use only credentialed `GET /api/parish/settings` reads.
- The shared parish settings read-model parser validates the nested response before names may reach the form.
- Server-side staff authentication and selected active-parish membership remain authoritative.
- Unmount and replacement abort obsolete reads and clear their timers.
- Edit continues to preserve the currently assigned priest even when that name is no longer in the parish directory.
- Create/update actions, form validation, single-flight persistence, safe errors, and navigation are unchanged.

This slice adds no mutation, automatic assignment, send, export, storage access, signed URL, provider call, production flag, migration, RLS change, or public claim. It does not access production or parish records directly.

## Verified Identity

- Immutable implementation commit: `be04005d922cb3d2a0876b366104ee85a1f3d447`
- Tracked-head aggregate SHA-256: `C4B203E92F3A083BCC6D3E98719A0A5484C0A6AA86D1BB557CD3FDDB01882010`
- Committed release-source files: `1482`
- Production approval granted: `NO`

Focused parser, option-merge, deadline, active-parish detail scope, form persistence, and single-flight coverage passed `7` files / `34` tests. The first complete release run correctly stopped at its environment gate because this process inherited enabled non-production AI-summary QA residue. An isolated child process removed those variable names without changing saved values, then the complete `15`-check local release contract passed in `388.3` seconds with zero secret findings across `2,860` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `844` test files / `3,612` tests, and the credential-free Next.js 16.2.10 `56`-page build.

## Rollback

Restore the two clients' prior root-level response casts and remove the deadline controllers, timers, and shared response parser imports. Server authorization, Mass Intention persistence, and all stored data remain unchanged.
