# Membership-Aware Operational RLS Engineering And QA Technical Approval - 2026-07-11

Completion marker: `MEMBERSHIP_AWARE_RLS_ENGINEERING_QA_TECHNICAL_APPROVAL_20260711`

Decision: `ENGINEERING_APPROVED_FOR_FINAL_HUMAN_GO_NO_GO; QA_NONPRODUCTION_EVIDENCE_ACCEPTED; PRODUCTION_ROLLOUT_REMAINS_NO_GO`

## Scope Of This Approval

This record issues the engineering and QA approvals that can be supported by repository and non-production evidence. It does not invent or replace product-owner, security/data-owner, customer, legal/privacy, monitoring/support, or production rollback-owner approval.

No production environment was accessed. No migration was applied. Operational RLS and runtime behavior were not changed while preparing this record.

## Immutable SQL Identity

| Artifact | SHA-256 |
| --- | --- |
| `supabase/migrations/20260626170000_membership_aware_operational_rls.sql` | `24A8BC18F2717A9B42DBF23C9C8D43F09BEB59AA332FED2F5E82BB852AFB86F1` |
| `docs/sql/membership_aware_operational_rls_rollback_draft.sql` | `823BE85DF4BADEA7DC2650532FF4A9E6E1A188467163BFE01299DCC44D610324` |

Hashes use UTF-8 content with LF line endings so the identity is stable across Windows and Linux checkouts. Any canonical hash change invalidates this technical approval until the changed SQL is reviewed and the forward/rollback evidence is repeated.

## Evidence Accepted

- Disposable forward and rollback validation completed with 45 membership-aware forward policies and a verified 45-policy rollback shape.
- Manual authenticated allow/deny QA passed 207 of 207 cases across People, Households, Sacramental Records, Mass Intentions, Requests, notes, communications, workflow steps, and documents.
- Route, document, direct-storage privacy, signed access, and family portal safety evidence passed in the approved disposable target.
- The promoted migration applied in non-production, rolled back, and verified both directions.
- Shared QA applied the migration, rehearsed rollback, restored the forward state, returned `checks.schema: true`, and passed authenticated workflow, document/family portal, and active-parish-cookie request/document smoke.
- The current repository passes 805 test files and 3,426 tests, TypeScript, ESLint, and a Next.js 16 production build.
- Repository secret scan passed across 2,133 text files with zero findings.
- Live npm advisory audit reported zero vulnerabilities across 575 dependencies.
- `check:rls-production-evidence` returned `RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW` with 34 of 34 linked artifacts present and no findings.

## Engineering Decision

Decision: `APPROVE_PRODUCTION_CANDIDATE_FOR_FINAL_HUMAN_GO_NO_GO`

Engineering accepts that:

- forward and rollback SQL are coherent and hash-bound;
- required membership helpers and policy shapes were verified;
- rollback is executable and was rehearsed;
- production application is a separate controlled database operation;
- no public-intake, export, AI, monitoring, or unrelated feature should be bundled; and
- the exact production-intended commit still must pass final checks immediately before rollout.

## QA Decision

Decision: `ACCEPT_NONPRODUCTION_EVIDENCE_WITH_PRODUCTION_SMOKE_REQUIRED`

QA accepts the disposable and shared-QA evidence as sufficient to request the final human go/no-go review. QA does not waive the production-safe fixture worksheet, pre/post health checks, active-parish request/document smoke, family portal safety smoke, monitoring observation, cleanup, or rollback decision capture during an approved rollout window.

## Approvals Still Required

1. Product owner: business risk, target, rollout window, scope, and exact approval phrase.
2. Security/data owner: production fixture privacy, cross-parish denial posture, document/family portal boundaries, retention, and evidence redaction.
3. Named production rollback operator and backup.
4. Named monitoring and support owners with a live channel.
5. Evidence storage owner and approved redaction location.
6. Exact production target labels and production-safe smoke fixture labels.
7. Immutable production-intended Git commit and final checks on that commit.

## Hard No-Go Boundary

Production remains `NO-GO`. Do not access production or apply the migration until all remaining owners and fixtures are named, the exact commit and rollout window are recorded, pre-apply health is green, and the product owner provides the separate phrase `APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT`.
