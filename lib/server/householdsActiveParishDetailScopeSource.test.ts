import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Households active parish detail scope source boundary', () => {
  it('keeps Household detail/edit loading on the active-parish server loader', () => {
    const loader = readRepoFile('lib/server/loadHouseholdDetail.ts')
    const detailPage = readRepoFile('app/dashboard/households/[id]/page.tsx')
    const editPage = readRepoFile('app/dashboard/households/[id]/edit/page.tsx')
    const detailView = readRepoFile('app/dashboard/households/[id]/HouseholdDetailPage.tsx')
    const editView = readRepoFile('app/dashboard/households/[id]/edit/EditHouseholdPage.tsx')

    expect(loader).toContain("import 'server-only'")
    expect(loader).toContain('resolveActiveStaffParishContext')
    expect(loader).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(loader).toContain(".from('households')")
    expect(loader).toContain(".eq('id', id)")
    expect(loader).toContain(".eq('parish_id', parishContext.activeParishId)")
    expect(loader).toContain(".from('household_members')")
    expect(loader).toContain(".eq('people.parish_id', parishContext.activeParishId)")
    expect(loader).toContain(".from('people')")
    expect(loader).toContain(".from('requests')")
    expect(loader).toContain(".from('sacramental_records')")

    expect(detailPage).toContain("import { loadHouseholdDetail }")
    expect(detailPage).toContain('const result = await loadHouseholdDetail(id)')
    expect(detailPage).toContain('<HouseholdDetailPage {...result} />')

    expect(editPage).toContain("import { loadHouseholdDetail }")
    expect(editPage).toContain('const result = await loadHouseholdDetail(id)')
    expect(editPage).toContain('const pageKey = [')
    expect(editPage).toContain('<EditHouseholdPage key={pageKey} {...result} />')

    expect(detailView).not.toContain("from '@/lib/supabase'")
    expect(detailView).not.toContain("from('households')")
    expect(detailView).not.toContain("from('household_members')")
    expect(detailView).not.toContain('useParams')
    expect(editView).not.toContain("from '@/lib/supabase'")
    expect(editView).not.toContain("from('households')")
    expect(editView).not.toContain("from('household_members')")
    expect(editView).not.toContain('useParams')
  })

  it('keeps Household and Household Member writes constrained to staff write parish context', () => {
    const actions = readRepoFile('app/dashboard/households/actions.ts')

    expect(actions).toContain('Household update used legacy parish context')
    expect(actions).toContain('Household member creation used legacy parish context')
    expect(actions).toContain('Household member update used legacy parish context')
    expect(actions).toContain('resolveStaffWriteParishContext(supabase')
    expect(actions).toContain(".eq('id', id)")
    expect(actions).toContain(".eq('parish_id', parishContext.parishId)")
    expect(actions).toContain("select('id')")
    expect(actions).toContain('clearOtherPrimaryContacts(supabase, id, parishContext.parishId)')
    expect(actions).toContain('const cleared = await clearOtherPrimaryContacts(')
    expect(actions).toContain("'update member ownership check failed'")
    expect(actions.indexOf('const { data: memberRow, error: memberLookupError }')).toBeLessThan(
      actions.indexOf('const cleared = await clearOtherPrimaryContacts(', actions.indexOf('export async function updateHouseholdMember'))
    )
    expect(actions).toContain('parish_id: parishContext.parishId')
    expect(actions).toContain('Household not found for the selected parish.')
    expect(actions).toContain('Person not found for the selected parish.')
    expect(actions).toContain('Household member not found for the selected parish.')
  })

  it('documents the production-safe boundary in current state docs', () => {
    const doc = readRepoFile('docs/HOUSEHOLDS_ACTIVE_PARISH_DETAIL_SCOPE_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('HOUSEHOLDS_ACTIVE_PARISH_DETAIL_SCOPE_20260708')
    expect(doc).toContain('SERVER-SCOPED HOUSEHOLD DETAIL/EDIT HARDENING')
    expect(doc).toContain('does not change operational RLS')
    expect(buildStatus).toContain('Households Active Parish Detail Scope')
    expect(roadmap).toContain('Households Active Parish Detail Scope')
    expect(sourceOfTruth).toContain('Households Active Parish Detail Scope')
  })
})
