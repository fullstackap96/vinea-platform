# Request Intake Editor Persistence Boundary

Date: 2026-07-11

Status: Implemented and locally verified.

## Purpose

The staff intake editor updates contact details, request notes, and Catholic request-type details in sequence. It must validate before writing, confirm each required row, and explain partial completion honestly if a later stage fails.

## Validation Before Writes

After staff authentication and selected active-parish request ownership are confirmed, Vinea now validates required Funeral, Wedding, and OCIA fields before the first contact or request mutation. Invalid input cannot leave behind an unintended contact-only or notes-only save.

## Positive Persistence

- Parishioner contact updates continue to require at least one returned scoped row.
- Baptism request details return only `id` and require a matched request row.
- Non-Baptism request notes return only `id` and require a matched request row.
- Funeral, Wedding, and OCIA detail upserts return only `request_id` and require a matched detail row.
- `request.intake.updated` history is written only after every required stage for that request type is confirmed.

## Partial-Success Guidance

If contact details were saved but a later request update fails, staff are told exactly which earlier stage was saved and which stage still needs retry. Raw database errors and technical details remain server-only.

## Explicit Exclusions

- No production access or staff edit execution.
- No migration or operational RLS change.
- No automatic scheduling, communication, certificate, AI, export, storage, or Google Calendar action.
- No claim that the multi-stage editor is transactionally atomic. A database transaction remains a separate schema/runtime design decision.

## Regression Coverage

`requestIntakeEditorPersistenceBoundary.test.ts` verifies pre-write Catholic field validation, positive contact/request/detail persistence, audit ordering, and explicit safe partial-success guidance.

## Production Boundary

This local hardening does not approve production deployment. Existing production-sensitive gates remain locked.
