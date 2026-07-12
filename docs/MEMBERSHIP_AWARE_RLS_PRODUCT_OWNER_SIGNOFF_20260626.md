# Membership-Aware Operational RLS Product-Owner Sign-Off - 2026-06-26

Status: Product-owner sign-off recorded for the next controlled promotion step only. This record does not move the migration candidate into `supabase/migrations`, does not apply operational RLS to shared QA or production, and does not approve production rollout.

## Decision

- Product-owner decision: `Approve next controlled non-production promotion preparation`
- Scope approved: The membership-aware operational RLS candidate may be considered ready for a future explicit prompt that promotes the candidate into `supabase/migrations` for non-production application and verification.
- Scope not approved in this record:
  - Production application.
  - Shared QA or production database changes.
  - Runtime public intake routing changes.
  - Any operational RLS application outside an explicitly approved non-production promotion step.
- Required next action: Get explicit approval before moving `docs/sql/membership_aware_operational_rls_migration_candidate.sql` into `supabase/migrations`.

## Safety Boundaries

- Production touched: `No`
- Shared QA project `gnfomgsuottcuueasfvi` touched: `No`
- Disposable project used for evidence: `kikqtorplsswepqitjys`
- Migration candidate moved into `supabase/migrations`: `No`
- Operational RLS applied to shared QA or production: `No`
- Runtime public intake routing enabled: `No`
- Secrets printed or committed: `No`

## Evidence Package Reviewed

- Disposable forward and rollback validation: `docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md`
- Manual authenticated cross-parish allow/deny QA: `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md`
- Route/document/family portal QA: `docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md`
- Promotion readiness checklist: `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`
- Non-production promotion plan: `docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_PLAN_20260626.md`
- Forward migration candidate: `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- Rollback draft: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`

## Evidence Summary

Disposable forward and rollback validation:

- Forward candidate applied cleanly in the approved disposable target.
- Rollback draft applied cleanly after the forward candidate.
- Forward policy count: `45`
- Forward membership-aware references: `45`
- Forward primary-parish references: `0`
- Rollback policy count: `45`
- Rollback membership-aware references: `0`
- Rollback primary-parish references: `45`
- Candidate added to applied migrations: `No`

Manual authenticated cross-parish QA:

- Total cases: `207`
- Passed cases: `207`
- Failed cases: `0`
- Areas covered: People, Households, Sacramental Records, Mass Intentions, Requests, request notes, request communications, workflow steps, and documents.
- Rollback applied after the manual QA run: `Yes`
- Disposable cleanup completed: `Yes`

Route/document/family portal QA:

- `/api/health` returned `checks.schema: true`.
- Request detail access API returned HTTP `200`.
- Request detail page route returned HTTP `200`.
- Staff document upload, signed URL generation, signed URL fetch, and approval passed.
- Direct Supabase Storage download through anon client was denied.
- Family portal token creation did not expose `token_hash`.
- Family portal page did not expose seeded private staff notes, audit text, AI notes, internal notes, or token hash.
- Family portal upload passed.
- Audit events existed for staff upload, staff review, portal token creation, and family upload.

## Checklist Gate Status

| Gate | Status | Notes |
|---|---|---|
| Candidate location and review | `Pass` | Candidate remains in `docs/sql`, not `supabase/migrations`. |
| Disposable forward validation | `Pass` | Completed against `kikqtorplsswepqitjys`. |
| Rollback evidence | `Pass` | Rollback restored primary-parish scoped policy shape in disposable validation. |
| Manual staff workflow QA | `Pass for database-level allow/deny coverage` | 207 authenticated allow/deny cases passed. Full browser UI pass was not repeated for every staff workflow. |
| Public, family, document, and external action QA | `Partial pass` | Document and family portal safety passed. Public intake, Google Calendar, Email, and AI were not rerun in this sign-off step. |
| Automated checks | `Pass` | Full test suite, lint, and production build passed after the route QA evidence update. |
| Product-owner sign-off | `Pass for next controlled non-production promotion step` | This record is not approval to apply to production. |

## Remaining Risks And Conditions

- The in-app browser dashboard interaction timed out after login during the route QA gate; final route evidence comes from authenticated live HTTP checks against the local disposable app.
- Disposable QA rows remain in the approved disposable project as evidence data.
- Public intake, Google Calendar, Email, and AI regression checks were not rerun as part of this product-owner sign-off record.
- A named technical owner should confirm the forward and rollback SQL one more time before promotion.
- A named QA owner should accept the completed disposable evidence package.
- A named security/data owner should accept the cross-parish deny evidence and family portal safety evidence.
- Production rollout requires a separate approval after non-production promotion and verification.

## Formal Sign-Off Record

| Role | Name | Date | Decision | Evidence Location |
|---|---|---|---|---|
| Product owner | Current Vinea product owner prompt | 2026-06-26 | `Approve next controlled non-production promotion preparation` | This document |
| Technical owner | Advisory Codex readiness recorded; named human sign-off pending | 2026-06-26 | `Recommend non-production-only promotion after explicit prompt` | Non-production promotion plan, candidate SQL, and rollback draft |
| QA owner | Advisory Codex readiness recorded; named human sign-off pending | 2026-06-26 | `Recommend non-production-only promotion after explicit prompt` | Completed disposable, manual QA, and route QA evidence docs |
| Security/data owner | Advisory Codex readiness recorded; named human sign-off pending | 2026-06-26 | `Recommend non-production-only promotion after explicit prompt` | Cross-parish deny evidence, direct storage denial, token hash non-exposure, and family portal safety evidence |

## Explicit No-Go Conditions Still Active

- Do not move the candidate into `supabase/migrations` without a new explicit approval.
- Do not apply operational RLS to shared QA or production from this record.
- Do not apply production RLS before non-production promotion and verification.
- Do not bundle public intake runtime routing with operational RLS promotion.
- Do not proceed if technical, QA, or security/data owners reject the evidence package.

## Final Outcome

- Outcome: `Product-owner sign-off recorded; promotion not executed`
- Recommended next prompt: Approve moving the membership-aware operational RLS candidate into `supabase/migrations` for non-production application only, after confirming the pending technical, QA, and security/data owner gates.
