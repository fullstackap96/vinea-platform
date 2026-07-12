import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('People active parish detail scope source boundary', () => {
  it('keeps People detail/edit loading on the active-parish server loader', () => {
    const loader = readRepoFile('lib/server/loadPersonDetail.ts')
    const detailPage = readRepoFile('app/dashboard/people/[id]/page.tsx')
    const editPage = readRepoFile('app/dashboard/people/[id]/edit/page.tsx')
    const detailView = readRepoFile('app/dashboard/people/[id]/PersonDetailPage.tsx')
    const editView = readRepoFile('app/dashboard/people/[id]/edit/EditPersonPage.tsx')

    expect(loader).toContain("import 'server-only'")
    expect(loader).toContain('resolveActiveStaffParishContext')
    expect(loader).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(loader).toContain(".from('people')")
    expect(loader).toContain(".eq('id', id)")
    expect(loader).toContain(".eq('parish_id', parishContext.activeParishId)")
    expect(loader).toContain(".eq('households.parish_id', parishContext.activeParishId)")
    expect(loader).toContain(".from('sacramental_records')")
    expect(loader).toContain(".from('requests')")

    expect(detailPage).toContain("import { loadPersonDetail }")
    expect(detailPage).toContain('const result = await loadPersonDetail(id)')
    expect(detailPage).toContain('<PersonDetailPage {...result} />')

    expect(editPage).toContain("import { loadPersonDetail }")
    expect(editPage).toContain('const result = await loadPersonDetail(id)')
    expect(editPage).toContain('<EditPersonPage {...result} />')

    for (const source of [detailView, editView]) {
      expect(source).not.toContain("from '@/lib/supabase'")
      expect(source).not.toContain("from('people')")
      expect(source).not.toContain('useParams')
    }
  })

  it('keeps People updates constrained to staff write parish context', () => {
    const actions = readRepoFile('app/dashboard/people/actions.ts')

    expect(actions).toContain('People update used legacy parish context')
    expect(actions).toContain('resolveStaffWriteParishContext(supabase')
    expect(actions).toContain(".eq('id', id)")
    expect(actions).toContain(".eq('parish_id', parishContext.parishId)")
    expect(actions).toContain("select('id')")
    expect(actions).toContain('Person not found for the selected parish.')
  })

  it('documents the production-safe boundary in current state docs', () => {
    const doc = readRepoFile('docs/PEOPLE_ACTIVE_PARISH_DETAIL_SCOPE_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('PEOPLE_ACTIVE_PARISH_DETAIL_SCOPE_20260708')
    expect(doc).toContain('SERVER-SCOPED PEOPLE DETAIL/EDIT HARDENING')
    expect(doc).toContain('does not change operational RLS')
    expect(buildStatus).toContain('People Active Parish Detail Scope')
    expect(roadmap).toContain('People Active Parish Detail Scope')
    expect(sourceOfTruth).toContain('People Active Parish Detail Scope')
  })
})
