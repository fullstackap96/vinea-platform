import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('dashboard request navigation safe link boundary', () => {
  it('keeps shared request navigation links on the dashboard href utility', () => {
    const navigation = readRepoFile('lib/dashboardRequestNavigation.ts')
    const reminders = readRepoFile('lib/workflowReminderDtos.ts')

    expect(navigation).toContain(
      "import { safeDashboardHref, safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(navigation).toContain('REQUEST_DETAIL_FALLBACK_HREF')
    expect(navigation).toContain('safeDashboardHrefOrFallback(')
    expect(navigation).toContain('safeDashboardHref(href)')
    expect(navigation).toContain('encodeURIComponent(id)')
    expect(reminders).toContain("import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'")
    expect(reminders).toContain('function requestHref(id: string): string')
    expect(reminders).toContain('safeDashboardHrefOrFallback(')
    expect(reminders).toContain('encodeURIComponent(normalizedId)')
  })

  it('documents read-only production safety and current-state references', () => {
    const doc = readRepoFile('docs/DASHBOARD_REQUEST_NAVIGATION_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Dashboard Request Navigation')
    expect(doc).toContain('dashboard-internal')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not send communications')
    expect(buildStatus).toContain('Dashboard Request Navigation Safe Link Boundary')
    expect(roadmap).toContain('Dashboard Request Navigation safe link boundary')
    expect(sourceOfTruth).toContain('Dashboard Request Navigation safe link boundary')
  })
})
