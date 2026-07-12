import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md'
)
const readinessRecordPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md'
)

describe('membership-aware RLS production final go/no-go review checklist', () => {
  it('is explicitly non-executing and keeps production blocked by default', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Status: Final go/no-go review checklist prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'It does not approve production execution.',
      'Current decision: `NO_GO_REVIEW_INCOMPLETE`',
      'Current recommendation: `Do not apply production RLS',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('cross-checks every required production readiness artifact and technical reference', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('defines scope guardrails and forbidden evidence content', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Production access has not started before the final approval prompt.',
      'No migration has been applied during review.',
      'Runtime public intake routing is out of scope.',
      'Runtime feature flags are out of scope.',
      'Operational RLS is unchanged during review.',
      'Staff membership data is unchanged during review.',
      'No unrelated production deployment is bundled into the RLS rollout.',
      'No secrets, database URLs, service role keys, session cookies, raw portal tokens, signed URLs, token hashes, private documents, internal notes, AI notes, or private audit payloads are copied into approval records.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires owner, fixture, smoke, support, rollout, rollback, and final-check completion', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '## Artifact Cross-Check Matrix',
      'Owner/sign-off capture packet',
      'Smoke fixture worksheet',
      'Smoke-test data checklist',
      'Support communication note',
      'Rollout evidence template',
      'Final approval readiness record',
      'Rollout/rollback packet',
      'Sign-off template',
      '## Owner And Sign-Off Cross-Check',
      '## Fixture And Smoke-Test Cross-Check',
      '## Support And Monitoring Cross-Check',
      '## Rollout Evidence And Rollback Cross-Check',
      '## Final Automated Check Cross-Check',
      'Product owner named',
      'Cross-parish denied request is safe and proves generic denial/no leak',
      'Family portal token plan avoids raw token storage',
      'Support message approvers are named',
      'Rollback owner is present during rollout window',
      '`npm.cmd test`',
      '`npm.cmd run lint`',
      '`npm.cmd run build`',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('keeps explicit hard stops and final decision boundaries', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Any missing owner, missing backup/contact path, `PENDING`, `Hold`, or `Reject` keeps the review at `NO_GO_REVIEW_INCOMPLETE`.',
      'Any fixture involving a funeral, sensitive pastoral situation, canonical case, private family situation, real private document, or confusing parish workflow keeps the review at `NO_GO_REVIEW_INCOMPLETE`.',
      'Missing monitoring, unavailable support owner, unclear escalation paths, or support instructions that ask for forbidden sensitive content keeps the review at `NO_GO_REVIEW_INCOMPLETE`.',
      'Missing rollback owner, missing rollback SQL review, missing evidence storage, or unclear production target identity keeps the review at `NO_GO_REVIEW_INCOMPLETE`.',
      'Any failing test, lint error, or build failure keeps the review at `NO_GO_REVIEW_INCOMPLETE`.',
      'GO_READY_FOR_PRODUCT_OWNER_APPROVAL',
      'NO_GO_REVIEW_INCOMPLETE',
      'NO_GO_MISSING_OWNER',
      'NO_GO_MISSING_FIXTURE',
      'NO_GO_MISSING_SMOKE_DATA',
      'NO_GO_MISSING_SUPPORT_OR_MONITORING',
      'NO_GO_MISSING_ROLLOUT_OR_ROLLBACK',
      'NO_GO_FINAL_CHECKS_NOT_RUN',
      'NO_GO_SCOPE_DRIFT',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires a separate product owner approval after the checklist is ready', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Even if this checklist reaches `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`, production still must not be touched until the product owner gives a separate explicit production approval prompt',
      'The production target.',
      'The approved rollout window.',
      'The approved production-intended commit or release.',
      'The named rollback owner.',
      'The named monitoring owner/channel.',
      'Confirmation that public intake runtime routing and unrelated deployments remain out of scope.',
      'Confirmation that the final readiness record decision is `GO`.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('is linked from the final readiness record as a blocking artifact', () => {
    const readinessRecord = readFileSync(readinessRecordPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      '| Final go/no-go review checklist |',
      '`PREPARED BUT INCOMPLETE`',
      'Blocks approval until every production artifact cross-checks cleanly',
      'Final go/no-go review checklist is completed.',
      'Final go/no-go review checklist decision is `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`.',
    ]) {
      expect(readinessRecord).toContain(expected)
    }
  })
})
