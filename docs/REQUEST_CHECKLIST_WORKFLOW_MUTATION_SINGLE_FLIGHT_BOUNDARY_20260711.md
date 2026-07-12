# Request Checklist And Workflow Mutation Single-Flight Boundary

Decision: `REQUEST_CHECKLIST_WORKFLOW_MUTATION_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without changing checklist or workflow data.

## Legacy Checklist

The legacy checklist now has one parent-owned synchronous mutation lock. It is acquired before the authenticated active-parish checklist API request and released after every outcome. While one item persists, every checklist toggle is disabled, the affected row displays `Saving...`, and the list exposes an accessible busy state.

Returned API failures and thrown network failures now appear through the existing curated Request Detail messages instead of being visible only in development diagnostics.

## Workflow Steps

Workflow-step Complete, Reopen, Start, and Skip actions now share one parent-owned synchronous lock. It is acquired before the selected-parish Server Action, so different buttons or different rows cannot dispatch competing status transitions. Every action is disabled while the affected row displays its existing saving state.

## Partial-Success Guidance

Confirmed persistence and subsequent view refresh are reported separately. If a checklist item or workflow step is saved but Request Detail cannot fully refresh, staff see explicit partial-success guidance and are told to refresh before making another change. Vinea does not encourage replaying a confirmed write.

## Preserved Boundaries

All status choices remain staff-reviewed. Existing authentication, same-origin protection, active-parish membership, same-parish request/item ownership, body limits, persistence confirmation, audit metadata, safe errors, and workflow rules remain authoritative.

This is same-page browser concurrency protection. It is not durable server idempotency, cross-tab/device replay protection, a database uniqueness rule, or workflow automation.

No production or shared-QA access, checklist/workflow mutation, credential use, communication, AI call, export, storage access, signed URL creation, provider or Calendar call, migration, operational RLS change, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/requestChecklistWorkflowMutationSingleFlightBoundary.test.ts` locks both parent mutation boundaries, acquisition order, safe errors, all-row disabled controls, row-specific progress, and partial-success guidance. Existing route/action tests continue to cover active-parish authorization, persistence confirmation, audit ordering, same-origin protection, and body-size limits.
