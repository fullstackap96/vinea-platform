import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('Request Detail loading skeleton', () => {
  it('replaces the isolated spinner with a stable workspace-shaped skeleton', () => {
    const page = read('app/dashboard/requests/[id]/page.tsx')
    const skeleton = read(
      'app/dashboard/requests/[id]/_components/RequestDetailLoadingSkeleton.tsx',
    )

    expect(page).toContain("import { RequestDetailLoadingSkeleton }")
    expect(page).toContain('if (loading) {')
    expect(page).toContain('return <RequestDetailLoadingSkeleton />')
    expect(skeleton).toContain('lg:grid-cols-[minmax(0,1fr)_320px]')
    expect(skeleton).toContain('animate-pulse')
    expect(skeleton).not.toContain('animate-spin')
  })

  it('keeps accessible loading semantics and no interactive controls', () => {
    const skeleton = read(
      'app/dashboard/requests/[id]/_components/RequestDetailLoadingSkeleton.tsx',
    )

    expect(skeleton).toContain('aria-busy="true"')
    expect(skeleton).toContain('aria-live="polite"')
    expect(skeleton).toContain('aria-label="Loading request"')
    expect(skeleton).toContain('Loading request workspace.')
    for (const marker of ['<button', '<a ', '<Link', 'onClick=', 'fetch(', 'supabase']) {
      expect(skeleton).not.toContain(marker)
    }
  })

  it('documents the read-only presentation boundary', () => {
    const doc = read('docs/REQUEST_DETAIL_LOADING_SKELETON_20260711.md')
    for (const phrase of [
      'REQUEST_DETAIL_LOADING_SKELETON_IMPLEMENTED_20260711',
      'stable workspace-shaped skeleton',
      'screen-reader loading announcement',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
