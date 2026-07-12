import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('mass intention navigation safe link boundary', () => {
  it('keeps mass intention list/detail/create/edit navigation on shared dashboard href helpers', () => {
    const helper = readRepoFile('lib/dashboardEntityNavigation.ts')
    const listView = readRepoFile('app/dashboard/intentions/IntentionsListView.tsx')
    const newPage = readRepoFile('app/dashboard/intentions/new/NewMassIntentionPage.tsx')
    const detailPage = readRepoFile('app/dashboard/intentions/[id]/MassIntentionDetailPage.tsx')
    const editPage = readRepoFile('app/dashboard/intentions/[id]/edit/EditMassIntentionPage.tsx')

    expect(helper).toContain('export const INTENTIONS_LIST_FALLBACK_HREF')
    expect(helper).toContain('export function massIntentionDetailHref')
    expect(helper).toContain('export function massIntentionEditHref')
    expect(helper).toContain('/dashboard/intentions/${encodeURIComponent(id)}')
    expect(helper).toContain('/dashboard/intentions/${encodeURIComponent(id)}/edit')

    expect(listView).toContain(
      "import { massIntentionDetailHref } from '@/lib/dashboardEntityNavigation'"
    )
    expect(listView).toContain('href={massIntentionDetailHref(intention.id)}')
    expect(listView).not.toContain('href={`/dashboard/intentions/${intention.id}`')

    expect(newPage).toContain(
      "import { massIntentionDetailHref } from '@/lib/dashboardEntityNavigation'"
    )
    expect(newPage).toContain('router.push(massIntentionDetailHref(result.intentionId))')
    expect(newPage).not.toContain('router.push(`/dashboard/intentions/${result.intentionId}`)')

    expect(detailPage).toContain(
      "import { massIntentionEditHref } from '@/lib/dashboardEntityNavigation'"
    )
    expect(detailPage).toContain('href={massIntentionEditHref(intention.id)}')
    expect(detailPage).not.toContain('href={`/dashboard/intentions/${intention.id}/edit`')

    expect(editPage).toContain(
      "import { massIntentionDetailHref } from '@/lib/dashboardEntityNavigation'"
    )
    expect(editPage).toContain('router.push(massIntentionDetailHref(intentionId))')
    expect(editPage).toContain('href={massIntentionDetailHref(intentionId)}')
    expect(editPage).toContain('onCancel={() => router.push(massIntentionDetailHref(intentionId))}')
    expect(editPage).not.toContain('router.push(`/dashboard/intentions/${intentionId}`)')
    expect(editPage).not.toContain('href={`/dashboard/intentions/${intentionId}`')
  })

  it('documents the production-safe Mass Intention navigation boundary', () => {
    const doc = readRepoFile('docs/MASS_INTENTION_NAVIGATION_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('MASS_INTENTION_NAVIGATION_SAFE_LINK_BOUNDARY_20260708')
    expect(doc).toContain('Mass Intention list, detail, create, and edit navigation')
    expect(doc).toContain('does not touch Google Calendar data')
    expect(doc).toContain('does not change operational RLS')
    expect(safeHrefDoc).toContain('Mass intention detail and edit navigation')
    expect(buildStatus).toContain('Mass Intention Navigation Safe Link Boundary')
    expect(roadmap).toContain('Mass Intention Navigation safe link boundary')
    expect(sourceOfTruth).toContain('Mass Intention Navigation safe link boundary')
  })
})
