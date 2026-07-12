import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('entity mutation navigation safe link boundary', () => {
  it('keeps entity create/edit success and cancel navigation on shared dashboard href helpers', () => {
    const newPerson = readRepoFile('app/dashboard/people/new/NewPersonPage.tsx')
    const editPerson = readRepoFile('app/dashboard/people/[id]/edit/EditPersonPage.tsx')
    const newHousehold = readRepoFile('app/dashboard/households/new/NewHouseholdPage.tsx')
    const editHousehold = readRepoFile('app/dashboard/households/[id]/edit/EditHouseholdPage.tsx')
    const newRecord = readRepoFile('app/dashboard/records/new/NewSacramentalRecordPage.tsx')
    const editRecord = readRepoFile('app/dashboard/records/[id]/edit/EditSacramentalRecordPage.tsx')

    expect(newPerson).toContain("import { personDetailHref } from '@/lib/dashboardEntityNavigation'")
    expect(newPerson).toContain('router.push(personDetailHref(result.personId))')
    expect(newPerson).not.toContain('router.push(`/dashboard/people/${result.personId}`)')

    expect(editPerson).toContain("import { personDetailHref } from '@/lib/dashboardEntityNavigation'")
    expect(editPerson).toContain('router.push(personDetailHref(personId))')
    expect(editPerson).toContain('href={personDetailHref(personId)}')
    expect(editPerson).toContain('onCancel={() => router.push(personDetailHref(personId))}')
    expect(editPerson).not.toContain('router.push(`/dashboard/people/${personId}`)')
    expect(editPerson).not.toContain('href={`/dashboard/people/${personId}`')

    expect(newHousehold).toContain(
      "import { householdEditHref } from '@/lib/dashboardEntityNavigation'"
    )
    expect(newHousehold).toContain('router.push(householdEditHref(result.householdId))')
    expect(newHousehold).not.toContain(
      'router.push(`/dashboard/households/${result.householdId}/edit`)'
    )

    expect(editHousehold).toContain(
      "import { householdDetailHref } from '@/lib/dashboardEntityNavigation'"
    )
    expect(editHousehold).toContain('router.push(householdDetailHref(householdId))')
    expect(editHousehold).toContain('href={householdDetailHref(householdId)}')
    expect(editHousehold).toContain('onCancel={() => router.push(householdDetailHref(householdId))}')
    expect(editHousehold).not.toContain('router.push(`/dashboard/households/${householdId}`)')
    expect(editHousehold).not.toContain('href={`/dashboard/households/${householdId}`')

    expect(newRecord).toContain("import { recordDetailHref } from '@/lib/dashboardEntityNavigation'")
    expect(newRecord).toContain('router.push(recordDetailHref(result.recordId))')
    expect(newRecord).not.toContain('router.push(`/dashboard/records/${result.recordId}`)')

    expect(editRecord).toContain("import { recordDetailHref } from '@/lib/dashboardEntityNavigation'")
    expect(editRecord).toContain('router.push(recordDetailHref(recordId))')
    expect(editRecord).toContain('href={recordDetailHref(recordId)}')
    expect(editRecord).toContain('onCancel={() => router.push(recordDetailHref(recordId))}')
    expect(editRecord).not.toContain('router.push(`/dashboard/records/${recordId}`)')
    expect(editRecord).not.toContain('href={`/dashboard/records/${recordId}`')
  })

  it('documents the read-only production safety boundary', () => {
    const doc = readRepoFile('docs/ENTITY_MUTATION_NAVIGATION_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Entity Mutation Navigation Safe Link Boundary')
    expect(doc).toContain('router.push')
    expect(doc).toContain('does not mutate records beyond existing form submissions')
    expect(doc).toContain('does not change operational RLS')
    expect(safeHrefDoc).toContain('Entity create/edit success and cancel navigation')
    expect(buildStatus).toContain('Entity Mutation Navigation Safe Link Boundary')
    expect(roadmap).toContain('Entity Mutation Navigation safe link boundary')
    expect(sourceOfTruth).toContain('Entity Mutation Navigation safe link boundary')
  })
})
