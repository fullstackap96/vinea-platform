import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Mass Intentions active parish detail scope source boundary', () => {
  it('keeps Mass Intention detail/edit loading on the active-parish server loader', () => {
    const loader = readRepoFile('lib/server/loadMassIntentionDetail.ts')
    const detailPage = readRepoFile('app/dashboard/intentions/[id]/page.tsx')
    const editPage = readRepoFile('app/dashboard/intentions/[id]/edit/page.tsx')
    const detailView = readRepoFile('app/dashboard/intentions/[id]/MassIntentionDetailPage.tsx')
    const editView = readRepoFile('app/dashboard/intentions/[id]/edit/EditMassIntentionPage.tsx')

    expect(loader).toContain("import 'server-only'")
    expect(loader).toContain('resolveActiveStaffParishContext')
    expect(loader).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(loader).toContain(".eq('id', id)")
    expect(loader).toContain(".eq('parish_id', parishContext.activeParishId)")

    expect(detailPage).toContain("import { loadMassIntentionDetail }")
    expect(detailPage).toContain('const result = await loadMassIntentionDetail(id)')
    expect(detailPage).toContain('<MassIntentionDetailPage {...result} />')

    expect(editPage).toContain("import { loadMassIntentionDetail }")
    expect(editPage).toContain('const result = await loadMassIntentionDetail(id)')
    expect(editPage).toContain('<EditMassIntentionPage {...result} />')

    for (const source of [detailView, editView]) {
      expect(source).not.toContain("from '@/lib/supabase'")
      expect(source).not.toContain("from('mass_intentions')")
      expect(source).not.toContain('useParams')
    }
  })

  it('keeps Mass Intention updates constrained to staff write parish context', () => {
    const actions = readRepoFile('app/dashboard/intentions/actions.ts')

    expect(actions).toContain('Mass Intention update used legacy parish context')
    expect(actions).toContain('resolveStaffWriteParishContext(supabase')
    expect(actions).toContain(".eq('id', id)")
    expect(actions).toContain(".eq('parish_id', parishContext.parishId)")
    expect(actions).toContain("select('id')")
    expect(actions).toContain('Mass intention not found for the selected parish.')
  })

  it('documents the production-safe boundary in current state docs', () => {
    const doc = readRepoFile('docs/MASS_INTENTIONS_ACTIVE_PARISH_DETAIL_SCOPE_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('MASS_INTENTIONS_ACTIVE_PARISH_DETAIL_SCOPE_20260708')
    expect(doc).toContain('SERVER-SCOPED DETAIL/EDIT HARDENING')
    expect(doc).toContain('does not change operational RLS')
    expect(buildStatus).toContain('Mass Intentions Active Parish Detail Scope')
    expect(roadmap).toContain('Mass Intentions Active Parish Detail Scope')
    expect(sourceOfTruth).toContain('Mass Intentions Active Parish Detail Scope')
  })
})
