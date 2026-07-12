# Dashboard Parish Switch Single-Flight Boundary

Status: Implemented and verified locally on 2026-07-11.

## Boundary

The dashboard shell now permits only one active-parish Server Action at a time. A synchronous client guard is acquired before the pending parish is shown and released in `finally` after success, a handled denial, or an unexpected failure.

Both responsive parish selectors expose `aria-busy` while the transition is pending. The existing workspace-updating state continues to hide old-parish Global Search and Notifications state until the new context is confirmed.

Server-owned membership validation, the HTTP-only cookie, exact selected-parish resolution, sensitive-tool remounting, and failure recovery to the previously confirmed parish remain unchanged. The client guard prevents out-of-order interaction; it does not replace authorization.

## Safety Boundary

No production access, parish switch, credential use, authentication or authorization-policy change, cookie write, staff/parish/request mutation, migration, operational RLS change, provider call, communication, export, AI call, sensitive flag change, or public trust claim occurred during implementation or verification.
