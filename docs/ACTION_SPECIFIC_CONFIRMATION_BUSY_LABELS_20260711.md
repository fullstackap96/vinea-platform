# Action-Specific Confirmation Busy Labels

Status: Implemented and verified locally on 2026-07-11.

## Boundary

The shared `VineaConfirmDialog` now accepts an optional action-specific `busyLabel`. The neutral default is `Working...`, so a new workflow cannot accidentally inherit duplicate-merge language.

Current busy callers provide explicit labels:

- People duplicate merge: `Merging...`
- Household duplicate merge: `Merging...`
- Request email-template replacement: `Replacing...`

The dialog's focus containment, Escape handling, focus restoration, disabled controls, no-op cancellation, and `aria-busy` behavior remain unchanged. This slice changes presentation only. It does not change authorization, send email, merge records during verification, access production, apply migrations, alter operational RLS, or enable production-sensitive flags.

## Why It Matters

Staff should always know what Vinea is doing. A template replacement that says `Merging...` looks unfinished and can make staff unsure whether the correct action is running. Action-specific progress language makes the interface calmer, more precise, and easier to trust.

## Verification

- Shared confirmation and workflow source tests cover the neutral default and explicit labels.
- Duplicate merge tests preserve the existing reviewed merge behavior and scoped APIs.
- Request email-template tests preserve staff review and the existing active-parish reply-draft API.
