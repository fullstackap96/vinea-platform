# Staff Access Single-Flight Mutation Boundary

Status: Implemented and verified locally on 2026-07-11.

## Boundary

Vinea now permits only one Staff Access mutation at a time in the Settings client, covering new staff additions as well as role and activation changes. The guard is acquired before the existing selected-parish Staff Access API request and released in `finally`, including failed and thrown requests. This means no more than one Staff Access row mutation or new-account addition can be in flight.

While an update is in progress:

- the affected row exposes `aria-busy`;
- the add-access form exposes `aria-busy` and displays `Adding...`;
- add controls and row controls cannot race each other;
- role and activation controls are disabled across the list to prevent conflicting requests;
- the affected activation control displays `Updating...`;
- existing success and curated error guidance remain unchanged.

The existing API still owns authentication, active-parish authorization, admin permission checks, self-deactivation protection, and final active administrator protection. This client guard is defense against duplicate interaction, not a replacement for server authorization.

## Safety Boundary

No production access, staff mutation, credential use, migration, operational RLS change, provider call, Google Calendar call, communication, export, AI call, sensitive flag change, or public trust claim occurred during implementation or verification.
