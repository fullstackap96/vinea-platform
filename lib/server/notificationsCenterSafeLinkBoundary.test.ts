import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Notifications Center safe link boundary', () => {
  it('keeps notification and suggested-action links on the shared dashboard href utility', () => {
    const notifications = readRepoFile('lib/notificationsCenter/buildNotificationsCenter.ts')
    const suggestedActions = readRepoFile(
      'lib/relationshipIntelligence/suggestedActionPresentation.ts'
    )

    expect(notifications).toContain("import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'")
    expect(notifications).toContain('encodeURIComponent(requestId)')
    expect(notifications).toContain('requestHref(requestId)')
    expect(suggestedActions).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(suggestedActions).toContain('recordPrefillHrefForRequest(action.requestId)')
    expect(suggestedActions).toContain('recordDetailHrefForSuggestedAction(action.recordId)')
    expect(suggestedActions).toContain('requestDetailHrefForSuggestedAction(action.requestId)')
    expect(suggestedActions).toContain('encodeURIComponent(normalizedRequestId)')
    expect(suggestedActions).toContain('encodeURIComponent(normalizedRecordId)')
  })

  it('documents the staff-facing notification link safety boundary', () => {
    const doc = readRepoFile('docs/NOTIFICATIONS_CENTER_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('dashboard-internal')
    expect(doc).toContain('does not mutate records')
    expect(buildStatus).toContain('Notifications Center Safe Link Boundary')
    expect(sourceOfTruth).toContain('Notifications Center safe link boundary')
  })
})
