import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const notePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md'
)
const readinessRecordPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md'
)

describe('membership-aware RLS production support communication note', () => {
  it('is explicitly non-executing and does not approve production RLS', () => {
    const note = readFileSync(notePath, 'utf8')

    for (const expected of [
      'Status: Communication note prepared only.',
      'No customer communication was sent',
      'production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'It is not a production approval',
      'not permission to apply production RLS',
      'Current outcome: `Production support communication note prepared; no customer communication sent`',
      'Current recommendation: `Do not apply production RLS until sign-offs, smoke-test data, rollout evidence ownership, support readiness, and explicit product-owner approval are complete`',
    ]) {
      expect(note).toContain(expected)
    }
  })

  it('defines communication boundaries and forbidden content', () => {
    const note = readFileSync(notePath, 'utf8')

    for (const expected of [
      '## Communication Boundaries',
      'Passwords.',
      'Session cookies.',
      'Supabase service role keys.',
      'Raw family portal tokens.',
      'Signed document URLs.',
      'Token hashes.',
      'Private document contents.',
      'Internal note bodies.',
      'AI notes or AI prompts.',
      'Other parish names or cross-parish object identifiers unless approved by the security/data owner.',
      'Do not claim:',
      'Production diocesan readiness.',
      'A breach or no-breach conclusion.',
    ]) {
      expect(note).toContain(expected)
    }
  })

  it('provides customer/support templates and triage paths for rollout issues', () => {
    const note = readFileSync(notePath, 'utf8')

    for (const expected of [
      '## Internal Support Brief',
      'Subject: Internal support brief - Vinea membership-aware RLS rollout',
      '## Customer Holding Reply - Permission Or Missing Data Report',
      'Subject: We are checking your Vinea access report',
      '## Customer No-Impact / Resolved Reply',
      'Subject: Update on your Vinea access report',
      '## Customer Escalation Notice - Possible Exposure',
      'Subject: Vinea is reviewing a possible access issue',
      '## Support Triage Matrix',
      'Staff sees another parish',
      'Family portal exposes internal data',
      'Direct storage access succeeds without signed URL',
    ]) {
      expect(note).toContain(expected)
    }
  })

  it('captures evidence, rollback triggers, and approval requirements', () => {
    const note = readFileSync(notePath, 'utf8')

    for (const expected of [
      '## Evidence To Collect',
      'Reporter name and parish.',
      'Active parish selected, if known.',
      'Audit event timestamp and event type, without private payloads.',
      'Whether rollback criteria are met.',
      '## Rollback Escalation Triggers',
      'Cross-parish record visibility.',
      'Family portal staff-only data visibility.',
      'Direct storage access without approved signed URL flow.',
      '## Approval Before Sending Customer Messages',
      '| Possible exposure notice | Incident commander and security/data owner |',
      '| Diocese or cluster coordination | Product owner, customer support owner, and security/data owner |',
    ]) {
      expect(note).toContain(expected)
    }
  })

  it('is linked from the final production readiness record while production remains no-go', () => {
    const readinessRecord = readFileSync(readinessRecordPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md',
      '| Customer/support communication note |',
      '| Customer/support communication note | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md` | `PREPARED` | Supports future approval |',
      'Customer/support communication note approvers and support owner are named.',
      'Customer/support communication note owner and approvers are assigned.',
      'Current decision: `NO-GO`',
      'Current recommendation: `NO-GO - do not apply production RLS`',
    ]) {
      expect(readinessRecord).toContain(expected)
    }
  })
})
