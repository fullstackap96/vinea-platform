# Request Document Mutation Single-Flight Boundary

Decision: `REQUEST_DOCUMENT_MUTATION_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without accessing storage, creating links, or changing records.

## Protected Operations

Request Detail now uses one synchronous browser lock across:

- staff document upload;
- staff approve/reject review; and
- one-time family upload link creation.

The lock is acquired before the corresponding authenticated, active-parish request API call. All three operations release in their existing `finally` paths after success or failure. While any write is active, the portal-link button, upload controls, review-note controls, and approve/reject buttons are disabled and the upload form exposes an accessible busy state.

Read-only signed document opening remains outside the mutation lock so viewing a document does not masquerade as a write or block staff unnecessarily. Existing popup safety and short-lived signed URL validation remain unchanged.

## Boundary

This prevents same-page overlapping or rapid duplicate document mutations. It is not durable server idempotency, cross-tab/device replay protection, or a transaction spanning storage and database writes. Existing upload cleanup, request ownership, active-parish membership, storage privacy, review audit metadata, portal-token hashing/expiry, curated errors, and partial-failure behavior remain authoritative.

No production or shared-QA access, storage access, signed URL creation, family token creation, document upload/review, record mutation, credential use, migration, operational RLS change, provider or Calendar call, communication, export, AI call, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/requestDocumentMutationSingleFlightBoundary.test.ts` locks synchronous acquisition before each write API, release paths, shared disabled controls, accessible busy state, and the read-only signed document opening boundary. Existing document route tests continue to cover authorization, cleanup, URL validation, review auditing, and safe errors.
