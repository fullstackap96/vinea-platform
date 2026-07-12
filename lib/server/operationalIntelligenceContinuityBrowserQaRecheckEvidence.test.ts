import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const recheckPath = join(
  repoRoot,
  'docs',
  'OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_RECHECK_20260705.md'
)
const checklistPath = join(
  repoRoot,
  'docs',
  'OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_CHECKLIST_20260705.md'
)
const blockedPath = join(
  repoRoot,
  'docs',
  'OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_EVIDENCE_20260705_BLOCKED.md'
)

describe('operational intelligence continuity browser QA recheck evidence', () => {
  it('records a passed safe localhost/shared-QA read-only recheck', () => {
    const evidence = readFileSync(recheckPath, 'utf8')

    for (const expected of [
      'Status: `PASSED - SAFE LOCALHOST/SHARED-QA READ-ONLY RECHECK`',
      'OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_RECHECK_PASSED_20260705',
      'Localhost Vinea app on port 3000',
      'Shared QA project label',
      '`/api/health` returned HTTP 200 with `checks.schema: true`',
      'Safe shared-QA staff browser session already authenticated',
      'Visible dashboard signal: 2 sacramental records need request-to-record review',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('preserves the dashboard and Records queue acceptance criteria', () => {
    const evidence = readFileSync(recheckPath, 'utf8')

    for (const expected of [
      'Parish Health Score showed `Request-to-record continuity`',
      'Operational Intelligence mentioned 2 request-to-record continuity review items',
      '/dashboard/records?continuity=needs_review',
      'Records Continuity filter was selected as `Needs request review` with value `needs_review`',
      '"continuityFilterLabel": "Needs request review"',
      '"continuityFilterValue": "needs_review"',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps the blocked evidence historical and the checklist as primary passed evidence', () => {
    const evidence = readFileSync(recheckPath, 'utf8')
    const checklist = readFileSync(checklistPath, 'utf8')
    const blocked = readFileSync(blockedPath, 'utf8')

    expect(evidence).toContain('primary passed checklist evidence')
    expect(evidence).toContain('historical evidence for the earlier stopped preflight')
    expect(checklist).toContain('OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_PASSED_LOCAL_SHARED_QA_20260705')
    expect(blocked).toContain('OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_BLOCKED_20260705_SAFE_PREFLIGHT_ONLY')
  })

  it('does not record credentials, raw identifiers, database URLs, tokens, or signed URLs', () => {
    const evidence = readFileSync(recheckPath, 'utf8')

    for (const forbidden of [
      '@',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'postgresql://',
      'access_token',
      'refresh_token',
      'X-Amz-Signature',
      'token=',
      '1400c3e0',
      'gnfomgsuottcuueasfvi.supabase.co',
      'sk-',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
