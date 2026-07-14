# Controlled Production Rollout Human Intake

Current decision state: `NO_GO_MISSING_HUMAN_INPUT`

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
| Product owner | `PENDING_HUMAN_INPUT` |
| Engineering rollout owner | `PENDING_HUMAN_INPUT` |
| Security/data owner | `PENDING_HUMAN_INPUT` |
| QA owner | `PENDING_HUMAN_INPUT` |
| Monitoring owner | `PENDING_HUMAN_INPUT` |
| Monitoring channel | `PENDING_HUMAN_INPUT` |
| Support owner | `PENDING_HUMAN_INPUT` |
| Support channel | `PENDING_HUMAN_INPUT` |
| Rollback owner | `PENDING_HUMAN_INPUT` |
| Evidence owner | `PENDING_HUMAN_INPUT` |
| Evidence storage label | `PENDING_HUMAN_INPUT` |

## Required Production-Safe Fixture Labels

All checks are read-only. Do not create fixtures during rollout unless a separate mutation approval exists.

| Field | Required value |
| --- | --- |
| Safe staff account | `PENDING_HUMAN_INPUT` |
| Authorized active parish A | `PENDING_HUMAN_INPUT` |
| Authorized parish-switch target B | `PENDING_HUMAN_INPUT` |
| Same-parish request | `PENDING_HUMAN_INPUT` |
| Cross-parish or unauthorized denial request | `PENDING_HUMAN_INPUT` |
| Onboarding read-only view | `PENDING_HUMAN_INPUT` |
| Imports read-only history | `PENDING_HUMAN_INPUT` |
| People duplicate-review page | `PENDING_HUMAN_INPUT` |
| Household duplicate-review page | `PENDING_HUMAN_INPUT` |
| Communications Center read-only view | `PENDING_HUMAN_INPUT` |
| Family portal denial fixture | `NOT_INCLUDED` |

`NOT_INCLUDED` is allowed only for the family portal denial fixture. Family portal testing is outside the base smoke unless separately approved.

## Required Rollout Window

Use an exact low-traffic date and time. The rollback observation end must be no earlier than the rollout end.

| Field | Required value |
| --- | --- |
| Rollout date | `PENDING_HUMAN_INPUT` |
| Rollout start time | `PENDING_HUMAN_INPUT` |
| Rollout end time | `PENDING_HUMAN_INPUT` |
| Timezone | `PENDING_HUMAN_INPUT` |
| Rollback observation end | `PENDING_HUMAN_INPUT` |

Recommended format: `2026-07-15`, `8:00 PM`, `8:30 PM`, `America/Chicago`, and `9:00 PM`.

## Availability And Scope Confirmations

Replace each pending value with `YES` only after the named humans have confirmed it. A `NO` answer keeps the rollout blocked.

| Field | Required value |
| --- | --- |
| All owners available for rollout and observation | `PENDING_HUMAN_INPUT` |
| Fixtures approved as production-safe and read-only | `PENDING_HUMAN_INPUT` |
| Health and staff smoke explicitly approved for the window | `PENDING_HUMAN_INPUT` |
| Monitoring and support channels open before promotion | `PENDING_HUMAN_INPUT` |
| Rollback owner can restore the fixed rollback deployment | `PENDING_HUMAN_INPUT` |
| Separately locked production gates remain disabled | `PENDING_HUMAN_INPUT` |
| Evidence will remain label-only and redacted | `PENDING_HUMAN_INPUT` |

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

## Explicit Approval Boundary

After the checker returns `READY_FOR_EXPLICIT_APPROVAL`, the product owner must still provide a separate message that:

1. Names the exact rollout window and all owner/fixture labels.
2. Approves promotion of only the fixed candidate deployment.
3. Approves only the bounded health and read-only staff smoke.
4. Names the fixed rollback deployment and stop criteria.
5. Repeats every forbidden production-sensitive capability from the checkpoint.

Until that separate approval is supplied, controlled production rollout remains `NO-GO`.

## Plain-English Summary

This worksheet gathers the people, safe test labels, and timing needed for a carefully controlled rollout. It contains no passwords or customer data, and filling it does not deploy anything. It simply makes the final human decision concrete and checkable.
