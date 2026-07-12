import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Daily operating-system signal inputs source wiring', () => {
  it('loads server-owned aggregate metadata and passes signals to score and reminders', () => {
    const dashboard = readRepoFile('app/dashboard/DashboardPageCore.tsx')
    const helper = readRepoFile('lib/dailyOperatingSystemSignals.ts')
    const route = readRepoFile('app/api/dashboard/daily-operating-signals/route.ts')
    const loader = readRepoFile('lib/server/loadDailyOperatingSystemSignals.ts')
    const workHubLoader = readRepoFile('lib/server/loadDashboardWorkHub.ts')

    expect(dashboard).toContain("fetch('/api/dashboard/work-hub'")
    expect(dashboard).not.toContain("fetch('/api/dashboard/daily-operating-signals'")
    expect(workHubLoader).toContain('loadDailyOperatingSystemSignals')
    expect(workHubLoader).toContain('Promise.all([')
    expect(dashboard).not.toContain("from('people')")
    expect(dashboard).not.toContain("from('households')")
    expect(route).toContain('requireStaffFromRequest(request)')
    expect(route).toContain('resolveActiveStaffParishContext')
    expect(route).not.toContain('createSupabaseServiceRoleClient')
    expect(loader).toContain("from('people')")
    expect(loader).toContain("from('households')")
    expect(loader).toContain("from('sacramental_records')")
    expect(loader).toContain("from('sacramental_record_events')")
    expect(loader).toContain('request_id')
    expect(loader).not.toMatch(/\bnotes\b.*select|select\([^)]*\bnotes\b/)
    expect(dashboard).toContain('operatingSignals: dailyOperatingSignals.healthSignals')
    expect(dashboard).toContain('buildDailyWorkHubOverview')
    expect(dashboard).toContain('certificateReady: dailyOperatingSignals.certificateReady')
    expect(dashboard).toContain('duplicateReview: dailyOperatingSignals.duplicateReview')
    expect(dashboard).not.toContain("from('request_documents').select")
    expect(dashboard).not.toContain('createSignedUrl')
    expect(loader).not.toContain('createSignedUrl')
    expect(loader).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.delete\(/)

    expect(helper).toContain('findPersonDuplicateCandidates')
    expect(helper).toContain('findHouseholdDuplicateCandidates')
    expect(helper).toContain('recordIdsWithCertificateEvent')
    expect(helper).toContain("import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'")
    expect(helper).toContain('certificateRecordHref')
    expect(helper).toContain('duplicateReviewHref')
    expect(helper).toContain('linkedSacramentalRecordCount')
    expect(helper).toContain('unlinkedSacramentalRecordCount')
    expect(helper).toContain('certificateActivityCount')
    expect(helper).not.toContain('insert(')
    expect(helper).not.toContain('update(')
    expect(helper).not.toContain('delete(')
  })

  it('documents the read-only boundaries for the daily operating-system signal inputs', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Daily Operating Signal Inputs Implemented')
    expect(buildStatus).toContain('No communications were sent')
    expect(buildStatus).toContain('no records were mutated')
    expect(roadmap).toContain('Daily Operating Signal Inputs')
    expect(roadmap).toContain('read-only people, household, sacramental record, and certificate-event metadata')
    expect(sourceOfTruth).toContain('Daily Operating Signal Inputs')
    expect(sourceOfTruth).toContain('read-only duplicate backlog, incomplete record, and certificate-ready')
    expect(sourceOfTruth).toContain('request-to-record continuity')
  })
})
