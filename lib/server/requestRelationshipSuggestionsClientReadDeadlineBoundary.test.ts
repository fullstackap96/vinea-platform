import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const componentPaths = [
  'app/dashboard/requests/[id]/_components/RequestPersonLinkSection.tsx',
  'app/dashboard/requests/[id]/_components/RequestRelationshipSuggestions.tsx',
]

const sources = componentPaths.map((path) => readFileSync(join(process.cwd(), path), 'utf8'))

describe('Request relationship suggestions client read deadline boundary', () => {
  it('gives both current relationship reads the same finite deadline', () => {
    for (const source of sources) {
      expect(source).toContain('const RELATIONSHIP_SUGGESTIONS_READ_TIMEOUT_MS = 15_000')
      expect(source).toContain('let readTimeoutId: number | undefined')
      expect(source).toContain(
        'readTimeoutId = window.setTimeout(\n        () => controller.abort(),\n        RELATIONSHIP_SUGGESTIONS_READ_TIMEOUT_MS,\n      )',
      )
      expect(source).toContain('signal: controller.signal')
    }
  })

  it('clears each deadline after settlement and during replacement cleanup', () => {
    for (const source of sources) {
      expect(
        source.match(
          /if \(readTimeoutId !== undefined\) window\.clearTimeout\(readTimeoutId\)/g,
        ),
      ).toHaveLength(2)
      expect(source).toContain('controller.abort()')
    }
  })

  it('distinguishes superseded cancellation from a current timeout', () => {
    for (const source of sources) {
      expect(source).toContain('if (cancelled) return')
      expect(source).not.toContain('if (cancelled || controller.signal.aborted) return')
    }

    expect(sources[0]).toContain("setLookupStatus('unavailable')")
    expect(sources[1]).toContain('setLoadUnavailable(true)')
    expect(sources[1]).toContain('if (!cancelled) setLoading(false)')
  })

  it('keeps both surfaces on the credentialed read-only request API', () => {
    for (const source of sources) {
      expect(source).toContain('/relationship-suggestions`')
      expect(source).toContain("credentials: 'include'")
      expect(source).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
      expect(source).not.toContain('createSignedUrl')
      expect(source).not.toContain('supabase.storage')
    }
  })
})
