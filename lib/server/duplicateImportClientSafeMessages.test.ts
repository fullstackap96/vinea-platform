import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function source(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('duplicate and import client safe messages', () => {
  it('routes duplicate review failures through the curated helper', () => {
    const people = source('app/dashboard/people/duplicates/PeopleDuplicatesPageClient.tsx')
    const households = source('app/dashboard/households/duplicates/HouseholdDuplicatesPageClient.tsx')

    expect(people).toContain("duplicateReviewClientErrorMessage('loadPeople', data?.error)")
    expect(people).toContain("duplicateReviewClientErrorMessage('mergePeople', data?.error)")
    expect(households).toContain("duplicateReviewClientErrorMessage('loadHouseholds', data?.error)")
    expect(households).toContain("duplicateReviewClientErrorMessage('mergeHouseholds', data?.error)")
    expect(people).not.toContain("message: data?.error ??")
    expect(households).not.toContain("message: data?.error ??")
  })

  it('routes import preview and commit failures through the curated helper', () => {
    const imports = source('app/dashboard/imports/DashboardImportsPageClient.tsx')

    expect(imports).toContain("importClientErrorMessage('preview', data?.error)")
    expect(imports).toContain("importClientErrorMessage('commit', data?.error)")
    expect(imports).not.toContain("message: data?.error ?? 'Could not preview import.'")
    expect(imports).not.toContain("message: data?.error ?? 'Could not import rows.'")
  })

  it('documents the client redaction boundary', () => {
    const doc = source('docs/DUPLICATE_IMPORT_CLIENT_SAFE_MESSAGES_20260709.md')

    for (const required of [
      'DUPLICATE_IMPORT_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260709',
      'Unexpected API or exception text is replaced',
      'Approved validation and parish-scope guidance remains visible',
      'does not change merge or import behavior',
      'does not expose raw database, provider, row, or credential details',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
