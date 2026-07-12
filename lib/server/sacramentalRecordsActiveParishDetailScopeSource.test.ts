import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Sacramental Records active parish detail scope source boundary', () => {
  it('keeps Record detail/edit loading on the active-parish server loader', () => {
    const loader = readRepoFile('lib/server/loadSacramentalRecordDetail.ts')
    const detailPage = readRepoFile('app/dashboard/records/[id]/page.tsx')
    const editPage = readRepoFile('app/dashboard/records/[id]/edit/page.tsx')
    const detailView = readRepoFile('app/dashboard/records/[id]/RecordDetailPage.tsx')
    const editView = readRepoFile('app/dashboard/records/[id]/edit/EditSacramentalRecordPage.tsx')

    expect(loader).toContain("import 'server-only'")
    expect(loader).toContain('resolveActiveStaffParishContext')
    expect(loader).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(loader).toContain(".from('sacramental_records')")
    expect(loader).toContain(".eq('id', id)")
    expect(loader).toContain(".eq('parish_id', parishContext.activeParishId)")
    expect(loader).toContain(".from('people')")
    expect(loader).toContain(".from('sacramental_record_events')")
    expect(loader).toContain(".eq('sacramental_record_id', id)")

    expect(detailPage).toContain("import { loadSacramentalRecordDetail }")
    expect(detailPage).toContain('const result = await loadSacramentalRecordDetail(id)')
    expect(detailPage).toContain('<RecordDetailPage {...result} />')

    expect(editPage).toContain("import { loadSacramentalRecordDetail }")
    expect(editPage).toContain('const result = await loadSacramentalRecordDetail(id)')
    expect(editPage).toContain('const pageKey = [')
    expect(editPage).toContain('<EditSacramentalRecordPage key={pageKey} {...result} />')

    for (const source of [detailView, editView]) {
      expect(source).not.toContain("from '@/lib/supabase'")
      expect(source).not.toContain("from('sacramental_records')")
      expect(source).not.toContain("from('people')")
      expect(source).not.toContain('useParams')
    }
  })

  it('keeps Record updates and person-link updates constrained to staff write parish context', () => {
    const actions = readRepoFile('app/dashboard/records/actions.ts')

    expect(actions).toContain('Sacramental Record update used legacy parish context')
    expect(actions).toContain('Sacramental Record person link update used legacy parish context')
    expect(actions).toContain('resolveStaffWriteParishContext(supabase')
    expect(actions).toContain(".eq('id', id)")
    expect(actions).toContain(".eq('parish_id', parishContext.parishId)")
    expect(actions).toContain("select('id')")
    expect(actions).toContain('Record not found for the selected parish.')
    expect(actions).toContain('Person not found for the selected parish.')
  })

  it('documents the production-safe boundary in current state docs', () => {
    const doc = readRepoFile('docs/SACRAMENTAL_RECORDS_ACTIVE_PARISH_DETAIL_SCOPE_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('SACRAMENTAL_RECORDS_ACTIVE_PARISH_DETAIL_SCOPE_20260708')
    expect(doc).toContain('SERVER-SCOPED SACRAMENTAL RECORD DETAIL/EDIT HARDENING')
    expect(doc).toContain('does not change operational RLS')
    expect(buildStatus).toContain('Sacramental Records Active Parish Detail Scope')
    expect(roadmap).toContain('Sacramental Records Active Parish Detail Scope')
    expect(sourceOfTruth).toContain('Sacramental Records Active Parish Detail Scope')
  })
})
