# Request Note Audit Metadata Privacy Boundary

Status: `IMPLEMENTED AND LOCALLY VERIFIED`

Date: 2026-07-10

## Purpose

Keep private internal note content in `request_notes` instead of duplicating a note preview into the broader `audit_events.metadata` surface.

## Implemented Boundary

- `addRequestNote` still requires authenticated selected-parish request access before inserting the note.
- The `request.note.created` audit event still records that a staff-reviewed note was added.
- Audit metadata now contains only `source: staff_request_detail` and the note character count.
- Note text, prefixes, summaries, contact details, identifiers, and raw payloads are not copied into audit metadata.
- Audit Log presentation remains clear because `request.note.created` already renders as `Internal note added` without relying on metadata summary text.

## Explicit Boundaries

- Note content or behavior changed: `NO`.
- Existing note or audit rows mutated during verification: `NO`.
- Production accessed: `NO`.
- Migration or operational RLS changed: `NO`.
- Communication sent or provider called: `NO`.
- Production-sensitive flag enabled: `NO`.
- Public trust claim approved: `NO`.

## Verification

- Focused request note audit privacy suite: `3 files / 7 tests passed`.
- Source guards reject `summary: body.slice`, raw `body`, and any summary field in the note audit block.
- Focused privacy plus release-evidence suite: `6 files / 16 tests passed`.
- Full Vitest regression suite: `695 files / 2,756 tests passed`.
- Standard and all-file TypeScript checks: `PASS`.
- Quiet lint: `PASS`.
- Next.js `16.2.10` production build: `PASS`, with `56` static pages generated.
- Repository secret scan: `1,888` text files scanned, `26` binaries skipped, `0` findings, and no secret values printed.
- Release handoff: `88` artifacts, `16` CI commands, `15` locked gates, and `0` findings.
- Completed local evidence: `510` required phrases and `0` findings.
- Production gate check: `15` gates remain locked and `0` findings.
- `git diff --check`: `PASS`; existing line-ending warnings only.

## Manual Follow-Up

In safe non-production, add an internal note containing synthetic sensitive-looking text. Verify the note appears only in the request's internal notes UI, the Audit Log title reads `Internal note added`, and the corresponding audit metadata contains a source label and length but no note words.
