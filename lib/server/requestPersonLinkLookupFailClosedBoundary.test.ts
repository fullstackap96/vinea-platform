import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const source = read(
  'app/dashboard/requests/[id]/_components/RequestPersonLinkSection.tsx',
)

describe('Request person-link lookup fail-closed boundary', () => {
  it('does not present link or create controls while directory status is unknown', () => {
    expect(source).toContain("'loading' | 'ready' | 'unavailable'")
    expect(source).toContain("setLookupStatus('loading')")
    expect(source).toContain("setLookupStatus('unavailable')")
    expect(source).toContain("lookupStatus === 'loading'")
    expect(source).toContain("lookupStatus === 'unavailable'")
    expect(source.indexOf("lookupStatus === 'unavailable'")).toBeLessThan(
      source.indexOf('resolvedPersonId && linkedPerson'),
    )
    expect(source).toContain(
      'People directory status could not be checked. Refresh this request before linking or',
    )
  })

  it('cancels stale relationship lookups and ignores their completion', () => {
    expect(source).toContain('const controller = new AbortController()')
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('if (cancelled) return')
    expect(source).toContain('controller.abort()')
  })

  it('mutually excludes person-link and create actions before dispatch', () => {
    expect(source).toContain('const actionInFlightRef = useRef(false)')
    expect(source.match(/if \(actionInFlightRef\.current \|\| lookupStatus !== 'ready'\) return/g))
      .toHaveLength(2)
    expect(source.match(/actionInFlightRef\.current = true/g)).toHaveLength(2)
    expect(source.match(/actionInFlightRef\.current = false/g)).toHaveLength(2)

    const linkGuard = source.indexOf(
      "if (actionInFlightRef.current || lookupStatus !== 'ready') return",
    )
    expect(linkGuard).toBeLessThan(source.indexOf('linkRequestToExistingPerson(requestId)'))

    const createStart = source.indexOf('async function handleCreatePerson()')
    const createGuard = source.indexOf(
      "if (actionInFlightRef.current || lookupStatus !== 'ready') return",
      createStart,
    )
    expect(createGuard).toBeLessThan(
      source.indexOf('createPersonFromRequestParishioner(requestId)', createStart),
    )
  })

  it('separates confirmed persistence from a failed request refresh', () => {
    expect(source).toContain(
      'Person profile was linked, but the refreshed request could not load.',
    )
    expect(source).toContain(
      'Person profile was created and linked, but the refreshed request could not load.',
    )
    expect(source.match(/} finally \{/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
    expect(source).toContain(
      "requestDetailClientServerActionErrorMessage('linkExistingPerson', error)",
    )
    expect(source).toContain(
      "requestDetailClientServerActionErrorMessage('createPersonProfile', error)",
    )
  })

  it('documents the integrity and production-safety boundary', () => {
    const doc = read('docs/REQUEST_PERSON_LINK_LOOKUP_FAIL_CLOSED_BOUNDARY_20260711.md')

    for (const phrase of [
      'REQUEST_PERSON_LINK_LOOKUP_FAIL_CLOSED_BOUNDARY_IMPLEMENTED_20260711',
      'does not mean',
      'no link/create controls',
      'confirmed persistence',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
