import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const surfaces = [
  {
    label: 'people',
    source: read('app/dashboard/people/duplicates/PeopleDuplicatesPageClient.tsx'),
    uncertain:
      'Vinea could not confirm whether the profiles were merged. Refresh duplicate review before trying again.',
  },
  {
    label: 'households',
    source: read('app/dashboard/households/duplicates/HouseholdDuplicatesPageClient.tsx'),
    uncertain:
      'Vinea could not confirm whether the households were merged. Refresh duplicate review before trying again.',
  },
]

describe('duplicate review client deadline boundary', () => {
  it.each(surfaces)('bounds $label loads and merge confirmation separately', ({ source }) => {
    expect(source).toContain('const DUPLICATE_REVIEW_LOAD_TIMEOUT_MS = 20_000')
    expect(source).toContain('const DUPLICATE_REVIEW_MERGE_TIMEOUT_MS = 120_000')
    expect(source).toContain('signal: AbortSignal.timeout(DUPLICATE_REVIEW_LOAD_TIMEOUT_MS)')
    expect(source).toContain('signal: AbortSignal.timeout(DUPLICATE_REVIEW_MERGE_TIMEOUT_MS)')
  })

  it.each(surfaces)(
    'forces refresh-before-retry after an uncertain $label merge without replaying it',
    ({ source, uncertain }) => {
      const mergeStart = source.indexOf('async function mergeSelected()')
      const mergeEnd = source.indexOf('\n  return (', mergeStart)
      const merge = source.slice(mergeStart, mergeEnd)

      expect(merge).toContain('setReviewRequiresRefresh(true)')
      expect(merge).toContain(uncertain)
      expect(merge).not.toContain('await mergeSelected()')
      expect(source).toContain('reviewRequiresRefresh ||')
    },
  )

  it.each(surfaces)(
    'keeps the $label single-flight lock and explicit confirmation before merge dispatch',
    ({ source }) => {
      const mergeStart = source.indexOf('async function mergeSelected()')
      const mergeFetch = source.indexOf("fetch('/api/", mergeStart)

      expect(source.indexOf("operationInFlightRef.current = 'merge'", mergeStart)).toBeLessThan(
        mergeFetch,
      )
      expect(source).toContain('setMergeConfirmationOpen(true)')
      expect(source).toContain('operationInFlightRef.current ||')
    },
  )
})
