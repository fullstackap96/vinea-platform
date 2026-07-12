import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('audit log target safe link boundary', () => {
  it('keeps request target links on the shared request detail helper and dashboard sanitizer', () => {
    const page = readRepoFile('app/dashboard/admin/audit-log/AuditLogPage.tsx')
    const navigation = readRepoFile('lib/dashboardRequestNavigation.ts')

    expect(page).toContain("import { requestDetailHref } from '@/lib/dashboardRequestNavigation'")
    expect(page).toContain("import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'")
    expect(page).toContain('`${requestDetailHref(event.target_id)}#activity`')
    expect(page).not.toContain('`/dashboard/requests/${encodeURIComponent(event.target_id)}#activity`')
    expect(page).not.toContain("requestWorkflowDetailHref(event.target_id, 'activity')")

    expect(navigation).toContain(
      "import { safeDashboardHref, safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(navigation).toContain('safeDashboardHrefOrFallback(')
    expect(navigation).toContain('encodeURIComponent(id)')
  })

  it('documents the audit log target handoff as read-only link hardening', () => {
    const doc = readRepoFile('docs/AUDIT_LOG_TARGET_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Audit Log request target links')
    expect(doc).toContain('does not mutate records')
    expect(safeHrefDoc).toContain('audit log request target links')
    expect(buildStatus).toContain('Audit Log Target Safe Link Boundary')
    expect(roadmap).toContain('Audit Log Target safe link boundary')
    expect(sourceOfTruth).toContain('Audit Log Target safe link boundary')
  })
})
