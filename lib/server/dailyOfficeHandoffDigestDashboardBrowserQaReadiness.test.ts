import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const readinessPath = join(
  repoRoot,
  'docs',
  'DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_BROWSER_QA_READINESS_20260705.md'
)

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('daily office handoff digest dashboard browser QA readiness', () => {
  it('records that browser QA is prepared but not executed', () => {
    const readiness = readFileSync(readinessPath, 'utf8')

    for (const expected of [
      'Status: `PREPARED - LABEL-ONLY DAILY OFFICE HANDOFF DASHBOARD BROWSER QA READINESS WORKSHEET`',
      'DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_BROWSER_QA_READINESS_PREPARED_20260705',
      'BROWSER_QA_NOT_RUN',
      'DAILY_OFFICE_HANDOFF_DASHBOARD_QA_READINESS_PREPARED',
      'http://localhost:3000/api/health` returned a connection failure',
      'Stopped before browser access',
      '"browserQaExecuted": false',
      '"status": "BLOCKED_PREPARED"',
    ]) {
      expect(readiness).toContain(expected)
    }

    for (const forbidden of [
      'Status: `PASSED',
      'BROWSER_QA_PASSED',
      '"browserQaExecuted": true',
    ]) {
      expect(readiness).not.toContain(forbidden)
    }
  })

  it('preserves the future dashboard acceptance criteria', () => {
    const readiness = readFileSync(readinessPath, 'utf8')

    for (const expected of [
      'after the Daily Work Hub overview',
      'before Parish Health Score',
      'Opening the office',
      'Midday check-in',
      'Before closing',
      'active parish label',
      'existing safe review queues',
      'Empty states are clear',
      'No send, export, certificate-generation, AI, automation, storage, signed URL, download, form, direct API, Supabase write, or mutation controls',
    ]) {
      expect(readiness).toContain(expected)
    }
  })

  it('matches the implemented dashboard card and docs status', () => {
    const readiness = readFileSync(readinessPath, 'utf8')
    const card = readRepoFile('app/dashboard/DashboardDailyOfficeHandoffDigest.tsx')
    const page = readRepoFile('app/dashboard/DashboardPageCore.tsx')
    const uiDoc = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_UI_20260705.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')
    const audit = readRepoFile('docs/VINEA_REPO_AUDIT.md')

    expect(readiness).toContain('app/dashboard/DashboardDailyOfficeHandoffDigest.tsx')
    expect(card).toContain('Daily office handoff')
    expect(card).toContain('Open existing queue')
    expect(card).toContain('Read-only boundary')
    expect(page).toContain('<DashboardDailyOfficeHandoffDigest')
    expect(page.indexOf('<DashboardDailyOfficeHandoffDigest')).toBeGreaterThan(
      page.indexOf('<DashboardDailyWorkHubOverview')
    )
    expect(uiDoc).toContain('DAILY_OFFICE_HANDOFF_DIGEST_DASHBOARD_UI_WIRED_20260705')
    expect(buildStatus).toContain('Daily Office Handoff Digest Dashboard Browser QA Readiness Prepared')
    expect(roadmap).toContain('Daily Office Handoff Digest Dashboard Browser QA Readiness')
    expect(sourceOfTruth).toContain('Daily Office Handoff Digest dashboard browser QA readiness worksheet')
    expect(audit).toContain('Daily Office Handoff Digest dashboard browser QA readiness worksheet')
  })

  it('keeps the worksheet read-only, non-production, and secret-free', () => {
    const readiness = readFileSync(readinessPath, 'utf8')

    for (const expected of [
      'Production app or production database accessed | `NO`',
      'Browser QA executed | `NO`',
      'Dashboard opened in a staff browser session | `NO`',
      'Records inserted, updated, linked, corrected, deleted, or automatically matched | `NO`',
      'Certificate or certificate PDF generated | `NO`',
      'Email, SMS, reminder, or family notification sent | `NO`',
      'Workflow automation, reminder runtime, or persistence enabled | `NO`',
      'Migration applied or operational RLS changed | `NO`',
      'AI route, export route, storage path, document file, or signed URL invoked | `NO`',
      'Public trust-center, backup/restore, export, RLS, monitoring, or compliance claim made | `NO`',
      'Secrets printed into evidence | `NO`',
    ]) {
      expect(readiness).toContain(expected)
    }

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
    ]) {
      expect(readiness).not.toContain(forbidden)
    }
  })
})
