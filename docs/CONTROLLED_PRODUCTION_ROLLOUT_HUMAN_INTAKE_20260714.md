# Controlled Production Rollout Human Intake

Current decision state: `READY_FOR_EXPLICIT_APPROVAL`

Date prepared: 2026-07-14

## Purpose

Use this worksheet to collect the remaining non-secret human inputs for the controlled Vinea base application rollout described in `docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260712.md`.

This worksheet does not approve deployment, production access, production smoke, migrations, operational RLS changes, production-sensitive flags, customer communication, or any separately locked capability. Completing it may advance the rollout only to `READY_FOR_EXPLICIT_APPROVAL`.

## Fixed Release Identity

These reviewed values are not human-fillable:

- Production app origin: `https://vineaplatform.com`
- Approved merged commit: `f134b598308ddd78b5b6b81ee447bf5b1fb15937`
- Existing candidate deployment: `dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG`
- Approved rollback deployment: `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW`
- Current production routing state: `RESTORED_TO_APPROVED_PRIOR_DEPLOYMENT`

If any fixed identity no longer matches the Vercel control plane or `main`, stop. Do not edit the value to make the worksheet pass; prepare new reviewed evidence.

## Safe Entry Rules

Enter labels only. A label identifies a person, channel, or synthetic/read-only fixture without exposing credentials or private parish data.

Allowed examples:

- `Alex Perez - Product Owner`
- `Vinea rollout operator - Engineering`
- `Production smoke staff account - password not recorded`
- `Production smoke Parish A`
- `Production smoke same-parish request - approved read-only fixture`
- `Vercel deployment observability dashboard - restricted owner access`

Never enter passwords, connection strings, API keys, access or refresh tokens, raw database identifiers, portal tokens, signed URLs, storage paths, private document details, parishioner contact details, pastoral/canonical details, internal note bodies, communication content, or raw audit metadata.

## Required Owners And Channels

Replace every `PENDING_HUMAN_INPUT` value with a real non-secret label. One person may fill multiple roles only when that assignment is intentional and the person can remain available for the entire rollout and rollback observation window.

| Field | Required value |
| --- | --- |
| Product owner | `Alex Perez - Product Owner` |
| Engineering rollout owner | `Alex Perez - Engineering Rollout Owner` |
| Security/data owner | `Alex Perez - Security/Data Owner` |
| QA owner | `Alex Perez - QA Owner` |
| Monitoring owner | `Alex Perez - Monitoring Owner` |
| Monitoring channel | `Vercel dashboards and this controlled rollout Codex task` |
| Support owner | `Alex Perez - Support Owner` |
| Support channel | `This controlled rollout Codex task` |
| Rollback owner | `Alex Perez - Rollback Owner` |
| Evidence owner | `Alex Perez - Evidence Owner` |
| Evidence storage label | `Vinea controlled rollout repository evidence record` |

## Required Production-Safe Fixture Labels

All checks are read-only. Do not create fixtures during rollout unless a separate mutation approval exists.

| Field | Required value |
| --- | --- |
| Safe staff account | `Production smoke staff account - password not recorded` |
| Authorized active parish A | `Production smoke authorized parish A` |
| Authorized parish-switch target B | `Production smoke authorized parish B` |
| Same-parish request | `Production smoke same-parish request - approved read-only fixture` |
| Cross-parish or unauthorized denial request | `Production smoke cross-parish request - generic denial expected` |
| Onboarding read-only view | `Production smoke Parish A Onboarding view - read-only` |
| Imports read-only history | `Production smoke Parish A Imports history - read-only, no upload or commit` |
| People duplicate-review page | `Production smoke Parish A People duplicate review page - read-only, no discovery or merge` |
| Household duplicate-review page | `Production smoke Parish A Household duplicate review page - read-only, no discovery or merge` |
| Communications Center read-only view | `Production smoke Parish A Communications Center - read-only, no touchpoint, follow-up, email, or SMS mutation` |
| Family portal denial fixture | `NOT_INCLUDED` |

`NOT_INCLUDED` is allowed only for the family portal denial fixture. Family portal testing is outside the base smoke unless separately approved.

## Required Rollout Window

Use an exact low-traffic date and time. The rollback observation end must be no earlier than the rollout end.

| Field | Required value |
| --- | --- |
| Rollout date | `2026-07-15` |
| Rollout start time | `8:00 PM` |
| Rollout end time | `8:30 PM` |
| Timezone | `America/Chicago` |
| Rollback observation end | `9:00 PM` |

Recommended format: `2026-07-15`, `8:00 PM`, `8:30 PM`, `America/Chicago`, and `9:00 PM`.

## Availability And Scope Confirmations

Replace each pending value with `YES` only after the named humans have confirmed it. A `NO` answer keeps the rollout blocked.

| Field | Required value |
| --- | --- |
| All owners available for rollout and observation | `YES` |
| Fixtures approved as production-safe and read-only | `YES` |
| Health and staff smoke explicitly approved for the window | `YES` |
| Monitoring and support channels open before promotion | `YES` |
| Rollback owner can restore the fixed rollback deployment | `YES` |
| Separately locked production gates remain disabled | `YES` |
| Evidence will remain label-only and redacted | `YES` |

## Validation

Run:

```powershell
node scripts/check-controlled-production-rollout-intake.mjs
```

Allowed decisions:

- `NO_GO_MISSING_HUMAN_INPUT`
- `NO_GO_FORBIDDEN_CONTENT`
- `NO_GO_INVALID_CONFIRMATION`
- `NO_GO_RELEASE_IDENTITY_MISMATCH`
- `READY_FOR_EXPLICIT_APPROVAL`

`READY_FOR_EXPLICIT_APPROVAL` means only that the product owner may provide the exact separate approval language from the checkpoint. It does not promote a deployment or authorize production access.

## Latest Repository Verification

The complete 15-check local release runner passed on 2026-07-14 from an LF-preserving clean checkout of branch commit `d60c3a8e` with its own exact lockfile dependency install:

- repository secret scan: `PASS` across `2,099` files with zero findings
- dependency security audit: `PASS` with zero known vulnerabilities
- release environment and every evidence gate: `PASS`
- both TypeScript scopes and lint: `PASS`
- complete tests: `834` files / `3,554` tests passed
- credential-free Next.js build: `PASS` with `56` generated static pages
- final decision: `LOCAL_RELEASE_READINESS_PASSED`

The product owner confirmed the non-secret owner labels, fixture labels, exact rollout window, and all seven availability/scope confirmations on 2026-07-14. This records intake readiness only and grants no production approval or production access. The checker now returns `READY_FOR_EXPLICIT_APPROVAL`.

## Explicit Approval Boundary

After the checker returns `READY_FOR_EXPLICIT_APPROVAL`, the product owner must still provide a separate message that:

1. Names the exact rollout window and all owner/fixture labels.
2. Approves promotion of only the fixed candidate deployment.
3. Approves only the bounded health and read-only staff smoke.
4. Names the fixed rollback deployment and stop criteria.
5. Repeats every forbidden production-sensitive capability from the checkpoint.

Until that separate approval is supplied, controlled production rollout remains `NO-GO`.

## Plain-English Summary

This worksheet now records the people, safe test labels, and timing for a carefully controlled rollout. It contains no passwords or customer data, and its completed state does not deploy or approve anything. It only makes a separate final production decision possible and checkable.
