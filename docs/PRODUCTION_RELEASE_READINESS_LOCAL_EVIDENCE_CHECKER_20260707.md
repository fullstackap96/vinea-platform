# Production Release Readiness Local Evidence Checker - 2026-07-07

Status: Implemented as a repository-only production-readiness verification helper.

## Purpose

`npm run check:release-local-evidence` validates the completed label-only local release evidence file after the full local release-readiness runner has passed.

The checker is intentionally narrower than `npm run check:release-local`: it does not rerun typecheck, lint, tests, or build. It verifies that the completed evidence record still contains the expected pass labels, safety boundaries, no-go decisions, and validator references.

## Safety Boundary

This checker does not deploy code, enable production flags, add production flags, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust-center claims.

## Current Command

```powershell
npm run check:release-local-evidence
```

Expected passing decision:

```text
LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW
```

## What It Checks

- The completed evidence file exists.
- The local evidence validator documentation exists.
- All twelve release-readiness command rows are present in order and marked `PASS`.
- The refreshed `LOCAL_RELEASE_READINESS_PASSED` runner decision is present.
- Production-sensitive feature approval, public trust claims, and production approval remain false.
- Required no-production, no-added-production-flags, no-migration, no-RLS-change, no-record-mutation, no-Google-Calendar-touch, no-export, no-AI, no-storage, no-signed-URL, no-communication, no-certificate, and no-public-claim boundaries remain present.
- Secret-like values such as database URLs, JWTs, API keys, service-role keys, anon keys, bearer/access/refresh tokens, signed URL markers, and raw UUIDs are absent.

## What It Does Not Prove

This checker does not prove production readiness by itself. It only proves the completed local release evidence remains internally consistent enough for human review.

Production-sensitive features remain `NO-GO` until their own approval packets, owner sign-offs, smoke evidence, rollback plans, and exact product-owner approval language are complete.
