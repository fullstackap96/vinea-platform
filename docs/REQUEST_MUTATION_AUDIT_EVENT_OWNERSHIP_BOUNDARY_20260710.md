# Request Mutation Audit Event Ownership Boundary - 2026-07-10

Status: `REQUEST_MUTATION_AUDIT_EVENT_OWNERSHIP_IMPLEMENTED_20260710`

## Scope

Vinea now records checklist updates, staff-note saves, suggested-date saves, and Funeral/Wedding detail saves from the authenticated active-parish request route that performed the corresponding database mutation. Request Detail no longer submits a second browser-authored audit event for those operations, and the generic Audit Events API rejects client-authored copies of the protected action names.

## Server-Owned Events

| Action | Owning route or operation | Safe metadata |
|---|---|---|
| `request.checklist.updated` | `PATCH /api/requests/[id]/checklist-items/[itemId]` | fixed source, owned checklist item id, completion boolean |
| `request.staff_notes.updated` | `PATCH /api/requests/[id]/staff-notes` | fixed source, note length, staff-review requirement |
| `request.suggested_dates.updated` | `PATCH /api/requests/[id]/suggested-dates` | fixed source, populated-date count, staff-review requirement |
| `request.intake.updated` | scoped Request Server Actions plus Funeral/Wedding detail routes | fixed source, allowlisted request type, staff-review requirement |

Each route writes the event only after its already-authorized selected-parish mutation succeeds. Parish id, request id, and actor identity come from the scoped request access result and authenticated staff session rather than browser metadata.

## Privacy And Integrity Boundary

The route-owned metadata does not contain:

- staff-note bodies or summaries;
- checklist labels;
- suggested dates or schedule values;
- deceased/family details, Funeral notes, Wedding names, or ceremony notes;
- prompts, AI output, communications, document content, token material, or secrets.

The protected operational records retain their existing staff-reviewed values and validation. This boundary changes audit ownership and metadata minimization only.

## Behavior Preserved

- Staff authentication, active-parish membership, and same-parish request ownership remain required.
- Checklist ownership and request-type checks still occur before mutation.
- Funeral and Wedding saves still preserve confirmed service/ceremony timestamps.
- Existing validation, staff messages, refresh behavior, safe error handling, and audit no-op behavior remain.
- No schedule/Google Calendar audit behavior is changed in this slice.

## Verification Boundary

- Focused mutation audit ownership suite: `7 files / 35 tests passed`.
- Focused mutation ownership plus release-evidence suite: `10 files / 44 tests passed`.
- Full Vitest regression suite: `696 files / 2,762 tests passed`.
- Standard and all-file TypeScript checks: `PASS`.
- Quiet lint: `PASS`.
- Next.js production build: `PASS` with Next.js `16.2.10` and `56` static pages generated.
- Repository secret scan: `1,892` text files scanned, `26` binaries skipped, `0` findings; secret values printed: `NO`.
- Release handoff: `90` artifacts, `16` CI commands, `15` locked gates, `0` findings.
- Completed local evidence: `510` required phrases, `0` findings.
- Production gate check: `15` locked gates, `0` findings.
- `git diff --check`: `PASS`; existing line-ending warnings only.
- No production environment was accessed.
- No record was mutated during verification.
- No email, OpenAI, Google Calendar, export, storage, or signed URL call was made.
- No migration or operational RLS change occurred.
- No production-sensitive flag was enabled.
- Production-sensitive features approved by this boundary: `NO`.
- Public trust claims approved by this boundary: `NO`.

Safe non-production QA should update synthetic same-parish fixtures, confirm one activity event per successful mutation, verify cross-parish attempts fail generically, and inspect metadata for labels/booleans/counts only.
