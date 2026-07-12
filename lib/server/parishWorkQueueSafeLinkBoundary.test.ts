import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('parish work queue safe link boundary', () => {
  it('keeps care calendar, communication, and intake queue links on the shared dashboard href utility', () => {
    const careCalendar = readRepoFile('lib/parishCareCalendar.ts')
    const communicationCenter = readRepoFile('lib/parishCommunicationCenter.ts')
    const intakeQueue = readRepoFile('lib/parishIntakeQueue.ts')

    for (const source of [careCalendar, communicationCenter, intakeQueue]) {
      expect(source).toContain(
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
      )
      expect(source).toContain('safeDashboardHrefOrFallback(')
      expect(source).toContain('encodeURIComponent')
    }
  })

  it('documents read-only production safety and current-state references', () => {
    const doc = readRepoFile('docs/PARISH_WORK_QUEUE_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('dashboard-internal')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not send communications')
    expect(buildStatus).toContain('Parish Work Queue Safe Link Boundary')
    expect(roadmap).toContain('Parish Work Queue safe link boundary')
    expect(sourceOfTruth).toContain('Parish Work Queue safe link boundary')
  })
})
