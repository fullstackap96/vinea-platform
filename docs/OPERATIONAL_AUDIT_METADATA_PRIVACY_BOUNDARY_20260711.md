# Operational Audit Metadata Privacy Boundary

Date: 2026-07-11

Status: Implemented and locally verified.

## Purpose

Audit history should prove who changed what and when without becoming a second store for parishioner names, private document filenames, or other values already held in authoritative records.

## Minimized Events

### Public intake and imports

- Public intake history retains request type, workflow-step count, and safe route-source metadata without the parishioner's full name, email, or phone.
- Import completion history retains import kind, safe row counts, and a staff-import source label without the uploaded filename.

### Request intake updates

- Retains request type and boolean contact/details-updated indicators.
- Removes the parishioner contact full name.
- Does not add email, phone, pastoral detail, or notes.

### Duplicate merges

- Retains scoped canonical/duplicate identifiers and safe moved/skipped counts.
- Removes canonical and duplicate Person/Household display names.

### Request documents

- Staff and family-portal upload history retains request/workflow references, document type, file-size count, and a safe upload-source label.
- Review history retains status and a generic status summary.
- Original filenames, storage paths, signed URLs, review notes, and document contents are excluded.

## Runtime Boundary

Staff authentication, selected active-parish request ownership, document storage behavior, signed URL behavior, merge authorization, audit action names, target ids, and visible document records remain unchanged. This only minimizes duplicated audit metadata.

## Regression Guard

`operationalAuditMetadataPrivacyBoundary.test.ts` extracts the relevant audit blocks, including public intake, imports, and family-portal upload history, and fails if contact values, names, filenames, storage material, signed URLs, or review notes re-enter them.

## Explicit Exclusions

- No production access, real audit write, migration, or operational RLS change.
- No document, merge, intake, storage, communication, Calendar, AI, export, or certificate execution.
- No deletion or rewrite of historical audit events already stored outside this repository.

## Production Boundary

This local privacy hardening does not approve production deployment or public trust claims. Existing production-sensitive gates remain locked.
