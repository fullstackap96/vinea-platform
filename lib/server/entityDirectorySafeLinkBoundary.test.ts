import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('entity directory safe link boundary', () => {
  it('keeps People, Household, and Records directory/detail links on shared entity href helpers', () => {
    const helper = readRepoFile('lib/dashboardEntityNavigation.ts')
    const peopleList = readRepoFile('app/dashboard/people/PeopleListView.tsx')
    const householdsList = readRepoFile('app/dashboard/households/HouseholdsListView.tsx')
    const recordsList = readRepoFile('app/dashboard/records/RecordsListView.tsx')
    const personDetail = readRepoFile('app/dashboard/people/[id]/PersonDetailPage.tsx')
    const householdDetail = readRepoFile('app/dashboard/households/[id]/HouseholdDetailPage.tsx')
    const recordDetail = readRepoFile('app/dashboard/records/[id]/RecordDetailPage.tsx')

    expect(helper).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    for (const expected of [
      'export function personDetailHref(personId: unknown): string',
      'export function personEditHref(personId: unknown): string',
      'export function householdDetailHref(householdId: unknown): string',
      'export function householdEditHref(householdId: unknown): string',
      'export function recordDetailHref(recordId: unknown): string',
      'export function recordEditHref(recordId: unknown): string',
      'encodeURIComponent(id)',
      'safeDashboardHrefOrFallback(',
    ]) {
      expect(helper).toContain(expected)
    }

    expect(peopleList).toContain("import { personDetailHref } from '@/lib/dashboardEntityNavigation'")
    expect(peopleList).toContain('href={personDetailHref(person.id)}')
    expect(peopleList).not.toContain('href={`/dashboard/people/${person.id}`')

    expect(householdsList).toContain(
      "import { householdDetailHref } from '@/lib/dashboardEntityNavigation'"
    )
    expect(householdsList).toContain('href={householdDetailHref(household.id)}')
    expect(householdsList).not.toContain('href={`/dashboard/households/${household.id}`')

    expect(recordsList).toContain("import { recordDetailHref } from '@/lib/dashboardEntityNavigation'")
    expect(recordsList).toContain('href={recordDetailHref(record.id)}')
    expect(recordsList).not.toContain('href={`/dashboard/records/${record.id}`')

    expect(personDetail).toContain('personEditHref(person.id)')
    expect(personDetail).toContain('householdDetailHref(membership.householdId)')
    expect(personDetail).toContain('recordDetailHref(record.id)')
    expect(personDetail).not.toContain('href={`/dashboard/people/${person.id}/edit`')
    expect(personDetail).not.toContain('href={`/dashboard/households/${membership.householdId}`')
    expect(personDetail).not.toContain('href={`/dashboard/records/${record.id}`')

    expect(householdDetail).toContain('householdEditHref(household.id)')
    expect(householdDetail).toContain('personDetailHref(member.person_id)')
    expect(householdDetail).not.toContain('href={`/dashboard/households/${household.id}/edit`')
    expect(householdDetail).not.toContain('href={`/dashboard/people/${member.person_id}`')

    expect(recordDetail).toContain('recordEditHref(record.id)')
    expect(recordDetail).not.toContain('href={`/dashboard/records/${record.id}/edit`')
  })

  it('documents the read-only production safety boundary', () => {
    const doc = readRepoFile('docs/ENTITY_DIRECTORY_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Entity Directory Safe Link Boundary')
    expect(doc).toContain('People, Households, and Sacramental Records')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not change operational RLS')
    expect(safeHrefDoc).toContain('Entity directory detail and edit links')
    expect(buildStatus).toContain('Entity Directory Safe Link Boundary')
    expect(roadmap).toContain('Entity Directory safe link boundary')
    expect(sourceOfTruth).toContain('Entity Directory safe link boundary')
  })
})
