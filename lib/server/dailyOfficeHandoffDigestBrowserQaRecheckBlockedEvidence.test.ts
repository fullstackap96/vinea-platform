import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('daily office handoff digest browser QA recheck blocked evidence', () => {
  it('records only a blocked safe preflight for the current recheck', () => {
    const evidence = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_RECHECK_20260705_BLOCKED.md')

    for (const expected of [
      'Status: `BLOCKED - SAFE PREFLIGHT ONLY; BROWSER NOT OPENED`',
      'DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_RECHECK_BLOCKED_20260705_SAFE_PREFLIGHT_ONLY',
      'BROWSER_QA_RECHECK_BLOCKED',
      'HEALTH_TARGET_UNAVAILABLE',
      'BROWSER_NOT_OPENED',
      'PRIOR_PASS_REMAINS_CURRENT_COMPLETED_QA_RECORD',
      '`http://localhost:3000/api/health` returned a connection failure',
      '| Browser QA executed | `NO` |',
      '"browserQaExecuted": false',
      '"reachable": false',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps the earlier passed evidence as the completed QA record', () => {
    const blocked = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_RECHECK_20260705_BLOCKED.md')
    const passed = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_EVIDENCE_20260705.md')
    const readiness = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_BROWSER_QA_READINESS_20260705.md')

    expect(blocked).toContain('remains the passed localhost/shared-QA evidence')
    expect(blocked).toContain('does not replace, weaken, or contradict that earlier pass')
    expect(passed).toContain('DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_PASSED_20260705')
    expect(readiness).toContain('DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_BROWSER_QA_READINESS_PREPARED_20260705')
  })

  it('preserves the read-only forbidden behavior boundaries', () => {
    const evidence = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_RECHECK_20260705_BLOCKED.md')

    for (const expected of [
      '| Production app or production database accessed | `NO` |',
      '| Browser QA opened | `NO` |',
      '| Safe staff session used | `NO` |',
      '| Dashboard opened | `NO` |',
      '| Records inserted, updated, linked, corrected, deleted, merged, or automatically matched | `NO` |',
      '| Certificate or certificate PDF generated | `NO` |',
      '| Email, SMS, reminder, or family notification sent | `NO` |',
      '| Workflow automation, reminder runtime, or persistence enabled | `NO` |',
      '| Migration applied or operational RLS changed | `NO` |',
      '| AI route, export route, storage path, document file, or signed URL invoked | `NO` |',
      '| Public trust-center, backup/restore, export, RLS, monitoring, or compliance claim made | `NO` |',
      '| Secrets printed into evidence | `NO` |',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps related VAOS docs current without adding secrets or raw identifiers', () => {
    const evidence = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_RECHECK_20260705_BLOCKED.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')
    const repoAudit = readRepoFile('docs/VINEA_REPO_AUDIT.md')

    expect(buildStatus).toContain('Daily Office Handoff Digest Browser QA Recheck Blocked')
    expect(roadmap).toContain('Daily Office Handoff Digest Browser QA Recheck Blocked')
    expect(sourceOfTruth).toContain('Daily Office Handoff Digest Browser QA recheck was blocked')
    expect(repoAudit).toContain('Daily Office Handoff Digest browser QA recheck blocker')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'OPENAI_API_KEY',
      'GOOGLE_CLIENT_SECRET',
      'access_token',
      'refresh_token',
      'X-Amz-Signature',
      'token=',
      'fbd34e8b',
      '7653197c',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
