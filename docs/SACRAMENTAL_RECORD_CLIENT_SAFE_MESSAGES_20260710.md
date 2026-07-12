# Sacramental Record Client Safe Messages

Decision: `SACRAMENTAL_RECORD_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260710`

Status: `IMPLEMENTED - STAFF CLIENT ERROR REDACTION`

Date: 2026-07-10

## Scope

The New and Edit Sacramental Record screens now route request-prefill, record creation, record update, and person-link update failures through an action-specific client allowlist.

Approved validation and staff guidance remain visible, including required person name, record type, selected-parish not-found/authorization guidance, duplicate request-to-record guidance, and stable action failure messages. An expired session receives plain sign-in guidance.

Unexpected database constraints, provider text, raw identifiers, private contact details, token material, object errors, and future unreviewed action messages are replaced by action-specific fallbacks before staff can see them.

## Preserved Behavior

- Sacramental record create, update, request-prefill, and person-link Server Actions are unchanged.
- Active-parish membership and write scope are unchanged.
- Register data, request links, person links, and validation behavior are unchanged.
- No record is created, updated, linked, or otherwise mutated by verification.

## Verification

- Focused helper and source tests cover all four client actions, approved guidance, session expiry, unexpected technical/private values, and both staff screens.
- Focused Sacramental Records client, action, and prefill verification passed: 4 test files / 9 tests.
- Expanded release-evidence verification passed: 9 test files / 24 tests.
- Full Vitest regression passed: 661 test files / 2,601 tests.
- All-file TypeScript and quiet lint pass.
- Repository secret scan passed: 1,809 text files scanned, 26 binary files skipped, and zero findings; no secret values were printed.
- Next.js `16.2.10` production build passed with all 53 static pages generated.
- Release handoff validation passed with 65 artifacts, 16 CI commands, 15 locked gates, and zero findings.
- Completed local evidence validation passed with 370 required phrases and zero findings.
- No production environment is accessed.
- No migration, operational RLS change, certificate generation, canonical decision, production flag, external send, or public trust claim is made.

Production-sensitive features approved by this boundary: `NO`.

Public trust claims approved by this boundary: `NO`.
