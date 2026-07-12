import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const source = read(
  'app/dashboard/requests/[id]/_components/RequestRelationshipSuggestions.tsx',
)

describe('Request relationship suggestions failure state', () => {
  it('cancels obsolete selected-parish suggestion reads', () => {
    expect(source).toContain('const controller = new AbortController()')
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('if (cancelled || controller.signal.aborted) return')
    expect(source).toContain('controller.abort()')
  })

  it('distinguishes an unavailable lookup from a successful empty result', () => {
    expect(source).toContain('const [loadUnavailable, setLoadUnavailable] = useState(false)')
    expect(source).toContain('if (!response.ok || !payload?.ok)')
    expect(source.match(/setLoadUnavailable\(true\)/g)).toHaveLength(2)
    expect(source).toContain('if (loadUnavailable)')
    expect(source).toContain('Suggested connections could not be checked.')
    expect(source.indexOf('if (loadUnavailable)')).toBeLessThan(
      source.indexOf('if (!resolvedPersonId && !hasPersonMatches)'),
    )
  })

  it('always settles a current failed read without settling an obsolete one', () => {
    expect(source).toContain('} finally {')
    expect(source).toContain(
      'if (!cancelled && !controller.signal.aborted) setLoading(false)',
    )
  })

  it('documents the read-only production-safety boundary', () => {
    const doc = read('docs/REQUEST_RELATIONSHIP_SUGGESTIONS_FAILURE_STATE_20260711.md')

    for (const phrase of [
      'REQUEST_RELATIONSHIP_SUGGESTIONS_FAILURE_STATE_IMPLEMENTED_20260711',
      'successful empty result',
      'does not remain stuck',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
