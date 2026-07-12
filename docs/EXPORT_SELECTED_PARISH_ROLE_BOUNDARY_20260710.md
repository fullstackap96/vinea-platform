# Export Selected-Parish Role Boundary

Status: Implemented and verified locally. Production exports remain `NO-GO`.

Date: 2026-07-10

## Purpose

The gated `request_list_basic` and `request_document_manifest` pilots now evaluate the authenticated staff member's role in the exact selected parish. An account-wide administrator role from another parish cannot elevate export permissions in the active parish.

## Implemented Boundary

- The export runtime gate still runs before authentication or database work.
- Staff authentication and active-parish membership resolution remain required.
- `loadAuthenticatedStaffRoleForParish(...)` reads only the active `parish_memberships.role` row for the selected parish and authenticated staff email.
- Selected-parish `admin` maps to `parish_admin`; selected-parish `staff` maps to `parish_secretary`.
- Missing, inactive, unsupported, or failed role lookups fail closed with the existing generic export-denial response.
- Denials write safe metadata with reason code `selected_parish_role_denied` before any service-role export query or file delivery.
- The export-audit reviewer routes this denial into the forged/cross-parish scope review queue.
- Permission evaluation and the existing safe audit event remain before export data queries and CSV delivery.

## Preserved Boundaries

- Both pilots remain disabled by default and production-blocked.
- No production flag was added or enabled.
- No dashboard navigation or production UI was added.
- No migration or operational RLS change was made.
- No production, storage, signed URL, Google Calendar, AI, email, or external provider access occurred.
- The document-manifest pilot remains manifest-only and does not expose storage paths, original filenames, signed URLs, file contents, tokens, notes, communications, AI material, or sacramental/canonical details.

## Verification

- Focused role, route, reviewer, and source-contract suite: 5 files / 37 tests passed.
- Full Vitest regression suite: 689 files / 2,725 tests passed.
- TypeScript: passed.
- Quiet lint: passed.
- Next.js 16.2.10 production build: passed with 56 static pages generated.
- Repository secret scan: 1,876 text files scanned, 26 binaries skipped, 0 findings, and no matched values printed.
- Release handoff: 83 artifacts, 16 CI commands, 15 locked gates, and 0 findings.
- Completed local evidence: 510 required phrases and 0 findings.
- `git diff --check`: passed with existing line-ending warnings only.
- Production accessed: no.
- Export runtime enabled: no.
- Export delivered during verification: no.
- Records mutated: no.

## Recommended Non-Production QA

Use a synthetic staff account that is admin in Parish A and staff in Parish B. With the existing non-production export approval flags only, confirm both pilots use `parish_admin` permissions in Parish A, `parish_secretary` permissions in Parish B, and deny generically when the selected-parish membership role is absent or unsupported. Confirm the denial appears in the forged/cross-parish export-audit reviewer filter without sensitive metadata.

## Production Boundary

This implementation is local production-readiness evidence only. It does not approve production exports, export reviewer production exposure, production flags, or production smoke. Existing owner approval, fixture, monitoring, rollback, and evidence gates remain required.
