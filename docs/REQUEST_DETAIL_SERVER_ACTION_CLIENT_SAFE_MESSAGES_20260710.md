# Request Detail Server Action Client Safe Messages

Decision: `REQUEST_DETAIL_SERVER_ACTION_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260710`

Status: `IMPLEMENTED - STAFF CLIENT ERROR REDACTION`

Date: 2026-07-10

## Scope

Request Detail now routes staff-facing Server Action failures through action-specific client allowlists for request status, workflow-step status, assignment, follow-up date, waiting-on status, workflow playbooks, internal notes, intake correction, existing-person linking, and request-derived person creation.

Approved validation, selected-parish not-found guidance, workflow/checklist prerequisites, family-intake correction guidance, and plain session-expiry guidance remain visible. Dynamic workflow-step titles are reduced to generic prerequisite guidance. Unexpected database text, raw identifiers, private contact details, credential material, object errors, and future unreviewed action messages use stable action-specific fallbacks before staff can see them.

## Preserved Behavior

- Request Detail Server Actions and active-parish request ownership checks are unchanged.
- Staff-reviewed status, assignment, follow-up, notes, intake, playbook, and person-link behavior is unchanged.
- Audit event behavior, database writes, and navigation are unchanged.
- Verification does not update requests, workflow steps, notes, checklist items, parishioners, or People records.

## Verification Boundary

- Focused helper and source tests cover ten Server Action message boundaries and the main Request Detail screen plus seven staff workflow components.
- Expanded Request Detail action and release-evidence verification passed: 10 test files / 32 tests.
- Full Vitest regression passed: 664 test files / 2,616 tests.
- All-file TypeScript and quiet lint passed.
- Repository secret scan passed: 1,815 text files scanned, 26 binary files skipped, and zero findings; no secret values were printed.
- Next.js `16.2.10` production build passed with all 53 static pages generated.
- Release handoff validation passed with 67 artifacts, 16 CI commands, 15 locked gates, and zero findings.
- Completed local evidence validation passed with 394 required phrases and zero findings.
- No production environment is accessed.
- No migration, operational RLS change, production flag, external send, record mutation, AI call, export, storage access, or public trust claim is made.

Production-sensitive features approved by this boundary: `NO`.

Public trust claims approved by this boundary: `NO`.
