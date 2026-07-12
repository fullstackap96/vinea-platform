import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('email dashboard link safety boundary', () => {
  it('keeps generated request notification and daily brief links on safe dashboard helpers', () => {
    const notification = readRepoFile('lib/email/requestNotificationEmail.ts')
    const dailyBrief = readRepoFile('lib/email/parishDailyBriefEmail.ts')

    expect(notification).toContain(
      "import { requestDetailHref } from '@/lib/dashboardRequestNavigation'"
    )
    expect(notification).toContain('const dashboardPath = requestDetailHref(payload.requestId)')
    expect(notification).toContain('if (!/^https?:\\/\\//i.test(s)) return null')
    expect(notification).not.toContain('`/dashboard/requests/${payload.requestId}`')

    expect(dailyBrief).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(dailyBrief).toContain("safeDashboardHrefOrFallback(href, '/dashboard')")
    expect(dailyBrief).toContain('if (!/^https?:\\/\\//i.test(base)) return safeHref')
    expect(dailyBrief).not.toContain('if (/^https?:\\/\\//i.test(href)) return href')
  })

  it('documents read-only production safety and current-state references', () => {
    const doc = readRepoFile('docs/EMAIL_DASHBOARD_LINK_SAFETY_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Email Dashboard Link Safety Boundary')
    expect(doc).toContain('dashboard-internal')
    expect(doc).toContain('does not send communications')
    expect(doc).toContain('does not mutate records')
    expect(buildStatus).toContain('Email Dashboard Link Safety Boundary')
    expect(roadmap).toContain('Email Dashboard Link Safety Boundary')
    expect(sourceOfTruth).toContain('Email Dashboard Link Safety Boundary')
  })
})
