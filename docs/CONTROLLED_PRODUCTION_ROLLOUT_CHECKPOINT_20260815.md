# Controlled Production Rollout Checkpoint

Current decision: `MAIN MERGED; MAIN ARTIFACT READY; PUBLIC DOMAINS ON ROLLBACK; PRODUCTION ROLLOUT NO-GO`

Prepared: 2026-08-15

## Purpose

This checkpoint binds the reviewed Daily Dashboard release to immutable GitHub
and Vercel control-plane evidence. It prepares a later controlled production
decision; it does not approve alias promotion, production application or data
access, production smoke, migrations, RLS changes, feature flags, providers,
storage, exports, record mutation, or public claims.

## Verified Release Identity

| Item | Verified state |
| --- | --- |
| Pull request | GitHub PR `#15`, merged and closed |
| Approved source head | `7c332bcae03347bf7b836adc2a697a41703484a6` |
| Approved base | `af631ad17fe557ace020489ad745b93e6d2af357` |
| Remote `main` | `06e1a0557297665a69b9171dfb137565597d65bf` |
| Required CI | Vinea CI run `31885701023`, completed successfully |
| Approved-head Vercel check | Successful |
| Approved-head Preview | `dpl_FdvCXMxu6iMCxjo2N3zcJnhQ9ewX`, `READY`, Preview-only |
| Approved-head Preview evidence | Health, staff sign-in, authorized parish A/B switching, dashboard focus navigation, responsive layout, and original-parish restoration passed without record mutation |

## Vercel Control-Plane Boundary

Vercel's Git integration automatically built merged `main` as
`dpl_95SD3gCpqr3RSDiK8YesebMQyPQu`. The artifact is `READY`, targets the Vercel
production environment, and is bound to the verified merge commit. No operator
deploy, alias-promotion, or production-smoke command was run.

The new artifact's reported aliases are limited to the Vercel project and main
aliases. Vercel control-plane metadata still maps `vineaplatform.com`,
`www.vineaplatform.com`, and `usevinea.com` to approved rollback deployment
`dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW` at commit
`c52d947b0f70ad01c8dc6920ad49979ca17d25d2`. No production application or data
access was performed to establish this boundary.

## Included Release Change

The merged change polishes the selected-parish Daily Dashboard into four
scan-friendly destinations: Focus now, Office handoff, Parish health, and Team
queues. It also updates the transitive `nanoid` lockfile resolution to `3.3.18`.
The release does not change dashboard loaders, APIs, active-parish
authorization, record writes, migrations, RLS, provider behavior, or
production-sensitive flags.

## Local Checkpoint Verification

- Focused checkpoint/current-status coverage: `3` files / `17` tests passed.
- Complete Vitest coverage: `882` files / `3,788` tests passed.
- Both TypeScript scopes and ESLint passed.
- Repository secret scanning passed across `2,963` text files with zero
  findings; `501` binary files were skipped.
- The dependency audit reported zero vulnerabilities.
- The Next.js `16.3.0` production build compiled all `56` pages successfully.

These checks validate the repository checkpoint only. They are not production
health, smoke, monitoring, or rollout evidence.

## Required Gates Before Any Rollout

Every item below must be explicitly reconfirmed in a future approved window:

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

Only after a separate exact product-owner approval:

1. Reconfirm all identities and gates above.
2. Promote only `dpl_95SD3gCpqr3RSDiK8YesebMQyPQu`; do not rebuild it.
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
- read-only Onboarding, Imports history, People and Household duplicate-review,
  Communications Center, and Daily Dashboard surfaces
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
