# Workflow Template Active-Parish Freshness Boundary

Status: `WORKFLOW_TEMPLATE_ACTIVE_PARISH_FRESHNESS_IMPLEMENTED_20260711`

## What changed

The Workflow Templates editor now receives the selected parish identifier as well as its display name. Its GET response includes the server-resolved active parish identifier, and the client requires that identifier to agree with the selected parish before rendering templates.

Template loads are abortable and latest-load-wins. Switching the selected parish invalidates the prior generation, clears the old editable template snapshot, and loads the newly authorized parish. A delayed response from the previous parish cannot settle templates, errors, or loading state.

Both template and step responses use strict allowlisted projections. Template IDs, request types, and step IDs must be unique; each step must belong to its containing template; owner, required, due-offset, and sort-order values must satisfy the established editor bounds. Unapproved database fields are discarded.

If a staff-reviewed save is already in flight when the active parish changes, its server request is allowed to settle honestly, but its old-parish response cannot update the newly selected parish editor.

## Safety boundary

- Existing staff authentication, membership checks, same-parish template ownership, same-origin protection, validation, and audit behavior remain authoritative.
- No workflow template write was executed during verification.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No communication, Google Calendar, AI, export, storage, or public-intake runtime action occurred.
