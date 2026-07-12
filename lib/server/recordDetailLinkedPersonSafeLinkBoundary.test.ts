import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('record detail linked-person safe link boundary', () => {
  it('keeps the sacramental record linked-person handoff on the shared entity href helper', () => {
    const source = readRepoFile('app/dashboard/records/[id]/RecordDetailPage.tsx')
    const helper = readRepoFile('lib/dashboardEntityNavigation.ts')

    expect(source).toContain("import { personDetailHref, recordEditHref } from '@/lib/dashboardEntityNavigation'")
    expect(source).toContain('href={personDetailHref(linkedPerson.id)}')
    expect(source).not.toContain('href={`/dashboard/people/${linkedPerson.id}`')

    expect(helper).toContain('export function personDetailHref(personId: unknown): string')
    expect(helper).toContain('safeDashboardHrefOrFallback(')
    expect(helper).toContain('encodeURIComponent(id)')
    expect(helper).toContain('PEOPLE_LIST_FALLBACK_HREF')
  })

  it('documents the read-only production safety boundary', () => {
    const doc = readRepoFile('docs/RECORD_DETAIL_LINKED_PERSON_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Record Detail Linked-Person Safe Link Boundary')
    expect(doc).toContain('sacramental record linked-person handoff')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not change operational RLS')
    expect(safeHrefDoc).toContain('Record detail linked-person handoffs')
    expect(buildStatus).toContain('Record Detail Linked-Person Safe Link Boundary')
    expect(roadmap).toContain('Record Detail Linked-Person safe link boundary')
    expect(sourceOfTruth).toContain('Record Detail Linked-Person safe link boundary')
  })
})
