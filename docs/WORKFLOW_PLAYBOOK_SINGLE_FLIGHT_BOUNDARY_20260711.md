# Workflow Playbook Single-Flight Boundary

Decision: `WORKFLOW_PLAYBOOK_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without adding checklist items.

## Protection

The Request Detail Workflow Playbook card now acquires a synchronous browser lock before applying missing checklist steps through its existing selected-parish Server Action. Rapid clicks cannot start two checklist insert sequences before React renders the disabled state.

Returned and thrown failures keep the existing curated guidance and release the card for retry. A successful result reports the persisted added count, releases, and invokes the existing checklist refresh. The card exposes an accessible busy state throughout the write.

## Boundary

Workflow playbook application remains staff-reviewed and manual. Existing request ownership, active-parish membership, missing-item calculation, insertion confirmation, audit metadata, and duplicate-aware sequential behavior remain unchanged.

This is same-page browser exclusion. It is not durable server idempotency, a uniqueness constraint, cross-tab/device replay protection, or workflow automation. A stronger concurrency guarantee would require a separately reviewed database constraint or transactional insertion strategy.

No production or shared-QA access, checklist mutation, credential use, communication, AI call, export, storage access, signed URL creation, provider or Calendar call, migration, operational RLS change, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/workflowPlaybookSingleFlightBoundary.test.ts` locks acquisition before the Server Action, safe release paths, accessible pending state, staff-reviewed language, and the no-idempotency boundary. Existing action tests continue to cover active-parish scope and confirmed insert behavior.
