# Request Content Audit Event Ownership Boundary - 2026-07-10

Status: `REQUEST_CONTENT_AUDIT_EVENT_OWNERSHIP_IMPLEMENTED_20260710`

## Scope

Vinea now records request AI-summary saves, reply-draft saves, and successful staff email delivery from the authenticated server route that performed the corresponding operation. The Request Detail browser no longer submits those audit events separately, and the generic Audit Events API rejects client-authored copies of these protected action names. The later Request Mutation Audit Event Ownership Boundary extends the same mechanism to checklist, staff-note, suggested-date, and intake-detail actions.

## Server-Owned Events

| Action | Owning route | Safe metadata |
|---|---|---|
| `request.ai_summary.updated` | `PATCH /api/requests/[id]/ai-summary` | fixed source, output length, staff-review requirement |
| `request.reply_draft.updated` | `PATCH /api/requests/[id]/reply-draft` | fixed source, draft length, staff-review requirement |
| `request.email.sent` | `POST /api/email/send` | fixed source, stored-recipient source label, subject length, body length |

Each event uses the parish id and request id from the already-authorized same-parish request access result plus the authenticated staff identity. AI save events occur only after the scoped request update succeeds. The email event occurs only after the existing provider reports success.

## Privacy And Integrity Boundary

These audit metadata objects do not contain:

- AI summaries, reply drafts, prompts, or generated output;
- email subjects, bodies, recipient addresses, or provider payloads;
- internal notes, communications, document contents, tokens, or secrets.

The protected request fields and scoped communication history retain their existing operational content. This change removes duplicate sensitive content from the broader audit trail; it does not remove the staff-reviewed source data.

## Behavior Preserved

- Staff authentication, active-parish membership, and same-parish request ownership remain required.
- The email recipient still comes from the stored request/parishioner relationship.
- Staff-entered subject/body and existing Resend provider behavior are unchanged.
- Request Detail and Daily Work Hub communication logging remain routed through the active-parish communications API.
- Existing AI generation, staff review, save behavior, and production gates are unchanged.
- Audit-write failure retains the existing best-effort/no-op behavior and does not replay a completed provider send or request update.

## Verification Boundary

- No production environment was accessed.
- No email was sent.
- No OpenAI or Google Calendar call was made.
- No migration or operational RLS change occurred.
- No production-sensitive flag was enabled.
- Production-sensitive features approved by this boundary: `NO`.
- Public trust claims approved by this boundary: `NO`.

## Verification Results

- Focused ownership suite: `6 files / 40 tests passed`.
- Focused ownership plus release-evidence suite: `9 files / 49 tests passed`.
- Full Vitest regression suite: `696 files / 2,761 tests passed`.
- Standard and all-file TypeScript checks: `PASS`.
- Quiet lint: `PASS`.
- Next.js production build: `PASS` with Next.js `16.2.10` and `56` static pages generated.
- Repository secret scan: `1,891` text files scanned, `26` binaries skipped, `0` findings; secret values printed: `NO`.
- Release handoff: `89` artifacts, `16` CI commands, `15` locked gates, `0` findings.
- Completed local evidence: `510` required phrases, `0` findings.
- Production gate check: `15` locked gates, `0` findings.
- `git diff --check`: `PASS`; existing line-ending warnings only.

Safe non-production QA should save a synthetic AI summary and reply draft, send only through an approved non-delivery/provider substitute, and confirm the resulting audit metadata contains labels/counts but none of the generated or contact content.
