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
    endpoint: "fetch('/api/people/duplicates'",
    canonical: 'canonicalPersonId',
    uncertain: 'Vinea could not confirm whether the profiles were merged.',
    confirmedRefresh: 'Profiles were merged, but duplicate review could not refresh.',
  },
  {
    label: 'households',
    source: read('app/dashboard/households/duplicates/HouseholdDuplicatesPageClient.tsx'),
    endpoint: "fetch('/api/households/duplicates'",
    canonical: 'canonicalHouseholdId',
    uncertain: 'Vinea could not confirm whether the households were merged.',
    confirmedRefresh: 'Households were merged, but duplicate review could not refresh.',
  },
] as const

describe('duplicate review operation integrity boundary', () => {
  it.each(surfaces)('$label mutually excludes discovery and merge operations', ({ source, endpoint }) => {
    expect(source).toContain("const operationInFlightRef = useRef<'load' | 'merge' | null>(null)")
    expect(source).toContain('if (operationInFlightRef.current) return')
    expect(source).toContain("operationInFlightRef.current = 'load'")
    expect(source).toContain("operationInFlightRef.current = 'merge'")
    expect(source.match(/operationInFlightRef\.current = null/g)).toHaveLength(2)

    const loadStart = source.indexOf('async function loadCandidates()')
    const loadEnd = source.indexOf('function selectCandidate', loadStart)
    const loadWrapper = source.slice(loadStart, loadEnd)
    expect(loadWrapper.indexOf('if (operationInFlightRef.current) return')).toBeLessThan(
      loadWrapper.indexOf('await loadCandidatesCore()'),
    )

    const mergeStart = source.indexOf('async function mergeSelected()')
    expect(source.indexOf('operationInFlightRef.current ||', mergeStart)).toBeLessThan(
      source.indexOf(endpoint, mergeStart),
    )
  })

  it.each(surfaces)('$label disables discovery and merge controls while work is unresolved', ({ source, canonical }) => {
    expect(source).toContain("disabled={status.kind === 'loading'}")
    expect(source).toContain("aria-busy={status.kind === 'loading'}")
    expect(source).toContain('reviewRequiresRefresh ||')
    expect(source).toContain(`!${canonical} || status.kind === 'loading'`)
  })

  it.each(surfaces)('$label requires a fresh scan after an uncertain or stale merge result', ({ source, uncertain, confirmedRefresh }) => {
    expect(source).toContain('const [reviewRequiresRefresh, setReviewRequiresRefresh] = useState(false)')
    expect(source).toContain('setReviewRequiresRefresh(true)')
    expect(source).toContain('setReviewRequiresRefresh(false)')
    expect(source).toContain(uncertain)
    expect(source).toContain(confirmedRefresh)
    expect(source).toContain('await loadCandidatesCore(true)')
  })

  it.each(surfaces)('$label releases its lock after returned or thrown failures', ({ source }) => {
    expect(source.match(/} finally \{/g)).toHaveLength(2)
    expect(source).toContain('duplicateReviewClientErrorMessage')
  })

  it('documents the reviewed production-safety boundary', () => {
    const doc = read('docs/DUPLICATE_REVIEW_OPERATION_INTEGRITY_BOUNDARY_20260711.md')

    for (const phrase of [
      'DUPLICATE_REVIEW_OPERATION_INTEGRITY_BOUNDARY_IMPLEMENTED_20260711',
      'People and Household',
      'uncertain completion',
      'merge was confirmed',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
