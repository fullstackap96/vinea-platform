# Production Monitoring Redaction Smoke Case Matrix

Date: 2026-07-06

Status: Implemented as a non-runtime production-readiness DTO matrix. This does not implement runtime monitoring, enable production monitoring, add production flags, wire an external monitoring vendor, send external events, page staff, create incidents, contact customers, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.

## Purpose

The monitoring redaction smoke QA packet lists the cases that must pass before production monitoring can be considered. This slice turns those cases into executable non-runtime DTO coverage in `lib/productionMonitoringRedactionSmokeCases.ts`.

## Covered Cases

- Authentication failure.
- Active-parish/RLS denial.
- Document portal denial.
- Family portal denial.
- Export denial.
- AI failure.
- Google Calendar failure.
- Email failure.
- `/api/health` failure.

Each case builds a safe observability event and label-only support routing result, then requires forbidden-payload assertions before any future monitoring delivery.

## Safety Expectations

The case matrix proves the safe DTO excludes synthetic examples of:

- Emails, passwords, session cookies, tokens, and OAuth codes.
- Raw request/person/household/document IDs and membership internals.
- Signed URLs, storage paths, original filenames, and document contents.
- Family portal token values, token hashes, internal notes, staff-only fields, and AI material.
- Raw CSV/export data, forbidden export fields, private document data, and raw export material.
- AI prompts, generated output, provider payloads, source bodies, and token material.
- Google OAuth tokens, calendar bodies, and Google credentials.
- Email provider secrets, private email body content, and unauthorized recipient lists.
- Database URLs, service-role keys, and raw environment dumps.
- Free-form text fields containing plain `access_token=...`, encoded `token%3D...`, signed URL markers, AWS signature markers, storage path markers, original filename markers, raw AI prompt/output markers, provider payload markers, and JSON-style sensitive fields. The safe event output should collapse sensitive key names to generic `[sensitive-key]` labels where needed so forbidden field labels are not preserved.

## What Changed Plain English

Vinea now has an executable checklist for future monitoring safety tests. It creates fake unsafe examples, runs them through the safe event DTO, and proves the safe result only contains labels and redacted placeholders.

## Production Boundary

Passing these unit tests does not approve production monitoring, production smoke, public trust-center monitoring claims, production exports, public intake routing, production membership-aware operational RLS promotion, customer-facing AI, backup/restore public claims, migrations, operational RLS changes, or customer communication automation.
