import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const readinessPath = join(
  repoRoot,
  'docs',
  'OPERATIONAL_INTELLIGENCE_CONTINUITY_EMPTY_STATE_BROWSER_QA_READINESS_20260705.md'
)

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('operational intelligence continuity empty-state browser QA readiness', () => {
  it('records that zero-continuity browser QA is prepared but not executed', () => {
    const readiness = readFileSync(readinessPath, 'utf8')

    for (const expected of [
      'Status: `PREPARED - LABEL-ONLY ZERO-CONTINUITY FIXTURE READINESS WORKSHEET`',
      'OPERATIONAL_INTELLIGENCE_CONTINUITY_EMPTY_STATE_BROWSER_QA_READINESS_PREPARED_20260705',
      'BROWSER_QA_NOT_RUN',
      'ZERO_CONTINUITY_FIXTURE_READINESS_PREPARED',
      'http://localhost:3000/api/health` was not reachable during this preflight',
      'Stopped before browser access',
      '"browserQaExecuted": false',
      '"status": "BLOCKED_PREPARED"',
    ]) {
      expect(readiness).toContain(expected)
    }
  })

  it('records the current follow-up blocker without replacing the passed evidence', () => {
    const readiness = readFileSync(readinessPath, 'utf8')

    for (const expected of [
      'FOLLOW_UP_RECHECK_BLOCKED - SAFE LOCAL APP TARGET UNAVAILABLE',
      'OPERATIONAL_INTELLIGENCE_CONTINUITY_EMPTY_STATE_BROWSER_QA_FOLLOW_UP_BLOCKED_20260705',
      'This follow-up check did not rerun browser QA.',
      'the running app prerequisite was unavailable',
      'REPEATED_FOLLOW_UP_RECHECK_BLOCKED - SAFE LOCAL APP TARGET STILL UNAVAILABLE',
      'OPERATIONAL_INTELLIGENCE_CONTINUITY_EMPTY_STATE_BROWSER_QA_REPEATED_FOLLOW_UP_BLOCKED_20260705',
      'received a connection failure',
      'This repeated blocker-only note preserves the existing passed evidence file as the latest completed browser QA record.',
      'Existing passed evidence changed by repeated run | `NO`',
      'docs/OPERATIONAL_INTELLIGENCE_CONTINUITY_EMPTY_STATE_BROWSER_QA_EVIDENCE_20260705.md',
      'Existing passed evidence changed | `NO`',
    ]) {
      expect(readiness).toContain(expected)
    }
  })

  it('preserves the future zero-continuity acceptance criteria', () => {
    const readiness = readFileSync(readinessPath, 'utf8')

    for (const expected of [
      'zero sacramental records needing request-to-record continuity review',
      'unlinkedSacramentalRecordCount` is zero',
      'Parish Health Score shows the continuity-clear cue',
      'No records currently need request-link review',
      'Vinea does not link records, generate certificates, send reminders, or make sacramental/canonical decisions',
      'no Records continuity review queue item is visible right now',
      '/dashboard/records?continuity=needs_review',
      'labels and pass/fail outcomes only',
    ]) {
      expect(readiness).toContain(expected)
    }
  })

  it('matches the implemented empty-state source and docs status', () => {
    const readiness = readFileSync(readinessPath, 'utf8')
    const helper = readRepoFile('lib/requestRecordContinuityEmptyState.ts')
    const health = readRepoFile('lib/parishHealthScore.ts')
    const brief = readRepoFile('lib/operationalIntelligenceBrief.ts')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')
    const audit = readRepoFile('docs/VINEA_REPO_AUDIT.md')

    expect(readiness).toContain('lib/requestRecordContinuityEmptyState.ts')
    expect(helper).toContain('No records currently need request-link review')
    expect(health).toContain('recordsContinuityEmptyState')
    expect(brief).toContain('No continuity review')
    expect(buildStatus).toContain('Continuity Empty-State Browser QA Readiness Prepared')
    expect(roadmap).toContain('zero-continuity empty-state browser QA readiness worksheet')
    expect(sourceOfTruth).toContain('zero-continuity empty-state browser QA readiness worksheet')
    expect(audit).toContain('zero-continuity empty-state browser QA readiness worksheet')
  })

  it('keeps the worksheet read-only, non-production, and secret-free', () => {
    const readiness = readFileSync(readinessPath, 'utf8')

    for (const expected of [
      'Production app or production database accessed | `NO`',
      'Records inserted, updated, linked, corrected, deleted, or automatically matched | `NO`',
      'Certificate or certificate PDF generated | `NO`',
      'Email, SMS, reminder, or family notification sent | `NO`',
      'Migration applied or operational RLS changed | `NO`',
      'AI route, export route, storage path, document file, or signed URL invoked | `NO`',
      'Public trust-center, backup/restore, export, RLS, monitoring, or compliance claim made | `NO`',
      'Secrets printed into evidence | `NO`',
    ]) {
      expect(readiness).toContain(expected)
    }

    for (const forbidden of [
      'Status: `PASSED',
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
      '@',
    ]) {
      expect(readiness).not.toContain(forbidden)
    }
  })
})
