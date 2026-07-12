# Family Portal Document Client Safe Messages - 2026-07-07

Status: Implemented as a scoped family-facing production-readiness hardening slice.

## Summary

The family portal document upload UI now passes failed upload messages through a small allowlist before showing them to families. Known safe validation/setup messages remain visible; unexpected browser, storage, provider, network, token, database, or exception details are replaced with calm generic guidance.

## What Changed

- Added `lib/familyPortalDocumentClientMessages.ts`.
- Updated `app/family/request/[token]/FamilyRequestDocumentsPortal.tsx` to use the safe upload-message helper for failed responses and caught exceptions.
- Added focused helper and source-level tests.

## Safety Boundary

This change does not alter family portal token validation, document upload validation, storage behavior, request-document insert behavior, audit writes, upload cleanup, staff document review, signed URL behavior, production flags, production access, migrations, operational RLS, public intake routing, Google Calendar behavior, exports, AI, communications, certificates, or public trust-center claims.

## Manual QA

In a safe non-production family portal fixture:

1. Open a valid family upload link.
2. Submit without a file and confirm the family sees the existing validation guidance.
3. Submit an over-size file and confirm the safe size guidance appears.
4. Force a temporary upload failure if practical and confirm the family sees generic guidance without raw provider text, storage paths, signed URLs, token material, database URLs, emails, or stack traces.

Do not use production family portal links or real private documents for this check.
