import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

function sha256(path: string) {
  const canonicalText = read(path).replaceAll('\r\n', '\n')
  return createHash('sha256')
    .update(canonicalText, 'utf8')
    .digest('hex')
    .toUpperCase()
}

describe('membership-aware RLS engineering and QA technical approval', () => {
  const approvalPath =
    'docs/MEMBERSHIP_AWARE_RLS_ENGINEERING_QA_TECHNICAL_APPROVAL_20260711.md'

  it('binds the reviewed forward and rollback SQL identities', () => {
    const approval = read(approvalPath)

    expect(approval).toContain(
      sha256('supabase/migrations/20260626170000_membership_aware_operational_rls.sql'),
    )
    expect(approval).toContain(
      sha256('docs/sql/membership_aware_operational_rls_rollback_draft.sql'),
    )
  })

  it('records scoped engineering and QA decisions without approving production', () => {
    const approval = read(approvalPath)

    expect(approval).toContain(
      'ENGINEERING_APPROVED_FOR_FINAL_HUMAN_GO_NO_GO; QA_NONPRODUCTION_EVIDENCE_ACCEPTED; PRODUCTION_ROLLOUT_REMAINS_NO_GO',
    )
    expect(approval).toContain('APPROVE_PRODUCTION_CANDIDATE_FOR_FINAL_HUMAN_GO_NO_GO')
    expect(approval).toContain('ACCEPT_NONPRODUCTION_EVIDENCE_WITH_PRODUCTION_SMOKE_REQUIRED')
    expect(approval).toContain('Product owner')
    expect(approval).toContain('Security/data owner')
    expect(approval).toContain('Production remains `NO-GO`')
    expect(approval).toContain('APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT')
  })

  it('links the decision into the current readiness and blocker records', () => {
    const checklist = read('docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md')
    const blockers = read('docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md')

    expect(checklist).toContain(approvalPath)
    expect(blockers).toContain(approvalPath)
    expect(blockers).toContain('TECHNICAL_APPROVAL_COMPLETE; PRODUCTION OPERATOR PENDING')
    expect(blockers).toContain(
      'NONPRODUCTION_EVIDENCE_ACCEPTED; PRODUCTION SMOKE OWNER PENDING',
    )
    expect(blockers).toContain('Current decision: `NO-GO`')
  })
})
