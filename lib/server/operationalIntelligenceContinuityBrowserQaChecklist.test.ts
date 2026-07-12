import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const checklistPath = join(
  repoRoot,
  'docs',
  'OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_CHECKLIST_20260705.md'
)

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('operational intelligence continuity browser QA checklist', () => {
  it('records a safe non-production browser QA pass for the continuity bottleneck dashboard cues', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Status: Executed as a safe local non-production browser QA checklist',
      'BROWSER_QA_PASSED_LOCAL_SHARED_QA',
      'unlinkedSacramentalRecordCount',
      'Parish Health Score',
      'Operational Intelligence Brief',
      '/dashboard/records?continuity=needs_review',
      'OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_PASSED_LOCAL_SHARED_QA_20260705',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('keeps pass/fail criteria focused on read-only continuity QA', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'checks.schema: true',
      'authenticated safe staff user',
      'request-to-record continuity factor',
      'records/documents insight',
      'verify originating request links manually',
      'Records continuity review queue',
      'Needs request review',
      'labels and pass/fail outcomes only',
      '"status": "PASSED"',
      '"schema": true',
      '"needsRequestReviewFilterSelected": true',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('matches the implemented dashboard source paths and Records queue label', () => {
    const checklist = readFileSync(checklistPath, 'utf8')
    const health = readRepoFile('lib/parishHealthScore.ts')
    const brief = readRepoFile('lib/operationalIntelligenceBrief.ts')
    const healthComponent = readRepoFile('app/dashboard/DashboardParishHealthScore.tsx')
    const briefComponent = readRepoFile('app/dashboard/DashboardOperationalIntelligenceBrief.tsx')
    const recordsFilters = readRepoFile('app/dashboard/records/RecordsListFilters.tsx')

    expect(checklist).toContain('app/dashboard/records/RecordsListFilters.tsx')
    expect(health).toContain("key: 'records_continuity'")
    expect(health).toContain('verify the originating request link manually')
    expect(health).toContain('/dashboard/records?continuity=needs_review')
    expect(brief).toContain("key: 'records_documents'")
    expect(brief).toContain('request-to-record continuity')
    expect(brief).toContain('/dashboard/records?continuity=needs_review')
    expect(healthComponent).toContain('Parish Health Score')
    expect(healthComponent).toContain('Signal coverage')
    expect(briefComponent).toContain('Where work is slowing down')
    expect(briefComponent).toContain('Safe-use boundaries')
    expect(recordsFilters).toContain('Needs request review')
  })

  it('preserves the forbidden production-sensitive boundaries and avoids secrets', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Production app, production database, and production data are not accessed',
      'No sacramental records are inserted, updated, linked, corrected, deleted, or automatically matched',
      'No certificate or certificate PDF is generated',
      'No email, SMS, reminder, or family notification is sent',
      'No migrations are applied and operational RLS is not changed',
      'No AI route, export route, storage access, document file access, or signed URL path is invoked',
      'No public trust-center, backup/restore, export, RLS, monitoring, or compliance claim is made',
    ]) {
      expect(checklist).toContain(expected)
    }

    for (const forbidden of [
      'Status: Completed',
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
      expect(checklist).not.toContain(forbidden)
    }
  })
})
