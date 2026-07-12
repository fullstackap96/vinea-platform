# Core Record Client Safe Messages

Decision: `CORE_RECORD_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260710`

Status: `IMPLEMENTED - STAFF CLIENT ERROR REDACTION`

Date: 2026-07-10

## Scope

People, Households, household membership, and Mass Intentions create/update screens now route Server Action failures through action-specific client allowlists.

Approved form validation, selected-parish authorization, not-found guidance, and plain session-expiry guidance remain visible. Unexpected database constraints, raw identifiers, private contact details, credential material, object errors, and future unreviewed action messages use stable action-specific fallbacks before staff can see them.

## Preserved Behavior

- People, Household, household member, and Mass Intention Server Actions are unchanged.
- Active-parish membership and write scope are unchanged.
- Form validation, write payloads, navigation, and database behavior are unchanged.
- Verification does not create or update People, Households, household members, or Mass Intentions.

## Verification Boundary

- Focused helper and source tests cover all eight client actions, approved guidance, session expiry, unexpected technical/private values, and six staff screens.
- Expanded core-record action and release-evidence verification passed: 10 test files / 43 tests.
- Full Vitest regression passed: 663 test files / 2,609 tests.
- All-file TypeScript and quiet lint passed.
- Repository secret scan passed: 1,813 text files scanned, 26 binary files skipped, and zero findings; no secret values were printed.
- Next.js `16.2.10` production build passed with all 53 static pages generated.
- Release handoff validation passed with 66 artifacts, 16 CI commands, 15 locked gates, and zero findings.
- Completed local evidence validation passed with 382 required phrases and zero findings.
- No production environment is accessed.
- No migration, operational RLS change, production flag, external send, record mutation, or public trust claim is made.

Production-sensitive features approved by this boundary: `NO`.

Public trust claims approved by this boundary: `NO`.
