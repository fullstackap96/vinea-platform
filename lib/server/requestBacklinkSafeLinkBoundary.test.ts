import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('request backlink safe link boundary', () => {
  it('keeps person and records request backlinks on the shared request detail helper', () => {
    const personDetail = readRepoFile('app/dashboard/people/[id]/PersonDetailPage.tsx')
    const recordDetail = readRepoFile('app/dashboard/records/[id]/RecordDetailPage.tsx')
    const newRecord = readRepoFile('app/dashboard/records/new/NewSacramentalRecordPage.tsx')
    const navigation = readRepoFile('lib/dashboardRequestNavigation.ts')

    expect(personDetail).toContain(
      "import { dashboardRequestOpenLabel, requestDetailHref } from '@/lib/dashboardRequestNavigation'"
    )
    expect(personDetail).toContain('href={requestDetailHref(request.id)}')
    expect(personDetail).not.toContain('href={`/dashboard/requests/${request.id}`')

    expect(recordDetail).toContain("import { requestDetailHref } from '@/lib/dashboardRequestNavigation'")
    expect(recordDetail).toContain('href={requestDetailHref(record.request_id)}')
    expect(recordDetail).not.toContain('href={`/dashboard/requests/${record.request_id}`')

    expect(newRecord).toContain("import { requestDetailHref } from '@/lib/dashboardRequestNavigation'")
    expect(newRecord).toContain('href={requestDetailHref(prefillRequestId)}')
    expect(newRecord).not.toContain('href={`/dashboard/requests/${prefillRequestId}`')

    expect(navigation).toContain(
      "import { safeDashboardHref, safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(navigation).toContain('safeDashboardHrefOrFallback(')
    expect(navigation).toContain('encodeURIComponent(id)')
  })

  it('documents request backlinks as read-only link hardening', () => {
    const doc = readRepoFile('docs/REQUEST_BACKLINK_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Person and Records request backlinks')
    expect(doc).toContain('does not mutate records')
    expect(safeHrefDoc).toContain('person and records request backlinks')
    expect(buildStatus).toContain('Request Backlink Safe Link Boundary')
    expect(roadmap).toContain('Request Backlink safe link boundary')
    expect(sourceOfTruth).toContain('Request Backlink safe link boundary')
  })
})
