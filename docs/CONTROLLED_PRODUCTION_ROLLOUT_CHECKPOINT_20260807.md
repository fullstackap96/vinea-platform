# Controlled Production Rollout Checkpoint

Current decision: `MAIN MERGED; RELEASE ARTIFACT READY; PRODUCTION ALIASES UNCHANGED; PRODUCTION ROLLOUT NO-GO`

Prepared: 2026-08-07

## Purpose

This checkpoint binds the merged Vinea release to immutable GitHub and Vercel
control-plane evidence. It prepares a later controlled production decision; it
does not approve production access, application smoke, alias promotion,
migrations, RLS changes, feature flags, providers, storage, exports, record
mutation, or public claims.

## Verified Release Identity

| Item | Verified state |
| --- | --- |
| Pull request | GitHub PR `#8`, merged and closed |
| Approved source head | `c7626c460714aae8dab459a79a30ad4a62f44486` |
| Remote `main` | `46190a71aa46146b4df0eb0a2e60cac8040572bd` |
| Merge parents | `f134b598308ddd78b5b6b81ee447bf5b1fb15937` and approved source head |
| Required CI | Vinea CI run `31215092349`, completed successfully |
| Approved-head Vercel check | Successful |
| Approved-head Preview | `dpl_3USyZGXXyiQ5VQCn5Qixsixixd6i`, `READY`, Preview-only |
| Approved-head Preview health | `ok: true`; all six reported checks `true` |
| Approved-head staff smoke | Sign-in, Parish A selection, same-parish request read, and generic cross-parish denial passed |

## Vercel Control-Plane Boundary

Vercel's Git integration automatically built merged `main` as
`dpl_EBrGS8ErXLVqctTqikUNUFh4mwj3`. The artifact is `READY`, targets the
production environment, and is bound to the verified merge commit. No operator
deploy or promotion command was run.

The public production domains remain assigned to the previously approved
rollback deployment `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW` at commit
`c52d947b0f70ad01c8dc6920ad49979ca17d25d2`. The new artifact's reported aliases
are limited to Vercel project/main aliases; `vineaplatform.com`,
`www.vineaplatform.com`, and `usevinea.com` still resolve in Vercel control-plane
metadata to the rollback deployment. No production application or data access
was performed to establish this boundary.

## Required Gates Before Any Rollout

Every item below must be explicitly confirmed in a future approved window:

1. Remote `main`, candidate deployment, and rollback deployment identities have
   not moved and remain eligible.
2. A new exact rollout date, start/end time, timezone, and rollback observation
   deadline are approved.
3. Product, engineering, security/data, QA, monitoring, support, rollback, and
   evidence owners are named and available.
4. Dedicated production-smoke authentication and label-only fixture selectors
   are available without repurposing QA credentials.
5. Monitoring and support channels are open for the complete window.
6. Production schema compatibility and read-only `/api/health` access are
   separately approved; no migration is implied.
7. Separately locked production-sensitive flags are confirmed disabled by name
   and scope only.
8. The read-only smoke boundary and redacted evidence rules are reconfirmed.

## Future Controlled Procedure

Only after a separate exact approval:

1. Reconfirm all identities and gates above.
2. Promote only `dpl_EBrGS8ErXLVqctTqikUNUFh4mwj3`; do not rebuild it.
3. Verify production aliases through Vercel control-plane metadata.
4. Run only approved health and read-only staff smoke.
5. Record label-only pass/fail evidence without secrets, raw IDs, or customer
   content.
6. Observe through the approved rollback deadline and record an explicit
   `KEEP` or `ROLLBACK` decision.
7. Restore `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW` immediately on any stop condition.

## Read-Only Smoke Boundary

The future smoke may cover only:

- `/api/health` with `checks.schema: true`
- dedicated safe staff sign-in
- authorized active-parish switching
- one same-parish request read and one generic cross-parish denial
- read-only Onboarding, Imports history, duplicate-review, and Communications
  Center surfaces
- browser-console and Vercel monitoring review

It must not send communications, run imports or duplicate discovery/merge,
access storage or signed URLs, call Google Calendar or AI, run exports, generate
certificates, change settings or routing, test family-portal tokens, apply
migrations, change RLS, mutate records, or create public trust claims.

## Stop And Rollback Criteria

Stop and restore the approved rollback deployment if health, authentication,
active-parish scope, same-parish reads, generic cross-parish denial, schema
compatibility, monitoring, owner availability, or redacted evidence handling
fails. Rollback is control-plane-only unless a separate instruction approves
application verification.

## Separately Locked Gates

This checkpoint grants no approval for production operational RLS, monitoring,
exports, export-reviewer exposure, public-intake routing, AI, workflow reminder
delivery, certificate issuance logging, sacramental correction/notation,
storage recovery claims, CSP runtime, retention/deletion execution, or public
trust-center claims.

## Exact Future Approval Boundary

A future product-owner instruction must name the exact main commit, candidate
and rollback deployment IDs, public production origin, rollout and observation
window, owners/channels, fixture labels, smoke boundary, stop criteria, and the
explicit approval to promote. Until that separate instruction is supplied and
all preflight gates pass, the decision remains `NO-GO`.
