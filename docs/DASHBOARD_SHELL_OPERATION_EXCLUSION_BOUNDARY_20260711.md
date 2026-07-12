# Dashboard Shell Operation Exclusion Boundary

Status: Implemented and verified locally on 2026-07-11.

Active-parish switching and logout are now mutually exclusive in the authenticated dashboard shell. Synchronous refs prevent either operation from entering while the other is in flight, including the instant before React can paint a disabled state.

The responsive controls mirror that boundary:

- logout is disabled while parish context is pending or transitioning;
- parish selectors are disabled while logout is in progress;
- existing operation-specific busy labels and status guidance remain visible.

The membership-checked Server Action, HTTP-only active-parish cookie, current-session-only sign-out, safe errors, redirects, sensitive-tool remounting, and failure recovery remain unchanged.

## Safety Boundary

No production access, real logout, parish switch, credential use, authentication or authorization-policy change, cookie write, record mutation, migration, operational RLS change, provider call, communication, export, AI call, sensitive flag change, or public trust claim occurred during implementation or verification.
