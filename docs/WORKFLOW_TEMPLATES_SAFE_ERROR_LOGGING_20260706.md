# Workflow Templates Safe Error Logging - 2026-07-06

Status: Implemented as a scoped authenticated staff-route production-readiness hardening slice.

## Scope

The workflow template settings API at `app/api/parish/workflow-templates/route.ts` now uses the shared `logServerError` helper for unexpected workflow template load, current-step lookup, template ownership lookup, and workflow step update failures.

## What Changed

- Unexpected load failures now return `Could not load workflow templates.`
- Unexpected update-path failures now return `Could not update workflow step.`
- Server logs keep sanitized troubleshooting context such as route label, action label, active-parish cookie presence, and whether a step id was present.
- The route no longer returns raw database exception text from `error.message`, `currentError.message`, `templateError.message`, or `updateError.message` to staff clients for unexpected server failures.

## Preserved Behavior

- Staff authentication is unchanged.
- Active-parish read scope is unchanged.
- Staff write parish context and primary-parish fallback compatibility are unchanged.
- Request body validation is unchanged.
- Workflow step patch normalization is unchanged.
- Same-parish workflow template ownership checks are unchanged.
- Existing audit writes for workflow template step updates are unchanged.
- Existing not-found and validation messages are unchanged.

## Explicit Non-Goals

- No production flags were added or enabled.
- No production data was accessed.
- No migrations were applied.
- No operational RLS policies were changed.
- No workflow template editing semantics were changed.
- No Google Calendar, AI, export, storage, signed URL, certificate, automation, public intake, staff access, or public trust-center behavior changed.

## Verification

- Focused tests: `npm.cmd test -- lib\server\workflowTemplateSettingsRoute.test.ts lib\server\safeErrorLogging.test.ts`
- Expected result: route source tests pass and confirm generic error responses, sanitized logging helper usage, active parish/write-safety wiring, and no raw server error reflection for unexpected workflow template failures.

## Manual QA Recommendation

Optional non-production smoke:

1. Sign in as safe staff.
2. Select a safe active parish.
3. Open Workflow Templates in Parish Settings.
4. Confirm templates load for the selected parish.
5. If approved for that non-production target, edit a safe workflow step.
6. Simulate unexpected load/current-step/template/update failures and confirm staff see only the generic workflow template messages.
7. Confirm server logs contain sanitized route/action details and do not contain raw database URLs, tokens, staff emails, raw provider payloads, or private parish data.

## Production Readiness Impact

This removes raw error reflection from a selected-parish admin route that controls parish workflow templates. It improves production hardening without changing the workflow template authorization or editing model.
